const querystring = require('querystring');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jose = require('jose');
const AWS = require('aws-sdk')

exports.handler = async (event) => {
    /*
    * Generate HTTP redirect response with 302 status code and Location header.
    */
    let secretName = "prod/rds-client-credentials";
    let config = { region : "ap-southeast-1" }
    let secretsManager = new AWS.SecretsManager(config);
    let secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
    let secretObject = JSON.parse(secretValue.SecretString)
    const connection = await mysql.createConnection({
        host: secretObject.host,
        user: secretObject.username,
        password: secretObject.password,
        database: secretObject.dbname
    });
    
    const {email, password, auth_code_id} = querystring.parse(event.body);

    // get auth_code and redirect_uri using auth_code_id
    const [rows1] = await connection.execute("SELECT auth_code, redirect_uri FROM auth where id=?", [auth_code_id]);
    const {auth_code, redirect_uri} = rows1[0];

    const params = {
        code: auth_code
    };
    const stringified_params = querystring.stringify(params);

    const redirectError = {
        statusCode: 500,
        headers: {
            Location: `${redirect_uri}/error`
        }
    };
    
    
    const [rows] = await connection.execute("SELECT id, hash_password, salt, role FROM users where email=?", [email]);

    // validate password
    if (rows.length == 0) {
        console.log("row length error");
        return redirectError;
    }

    const {id, hash_password, salt, role} = rows[0];
    const hashedInputPassword = await bcrypt.hash(password, salt);
    if (hashedInputPassword != hash_password) {
        console.log("hash_password error");
        return redirectError;
    }
    
    // retrieve keys
    secretName = "prod/keys";
    config = { region : "ap-southeast-1" }
    secretsManager = new AWS.SecretsManager(config);
    secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
    secretObject = JSON.parse(secretValue.SecretString)

    // generate access_token and id_token and refresh_token
    const alg = 'RS256'
    const privateKey = await jose.importPKCS8(secretObject.g1t4AsymmetricKey, alg)
    const access_token = await new jose.SignJWT({ user: { id, email } })
        .setProtectedHeader({ alg: alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .setIssuer('Bank App')
        .setAudience(redirect_uri)
        .sign(privateKey);

    // generate id_token
    const id_token = await new jose.SignJWT({ role })
        .setProtectedHeader({ alg: alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .setIssuer('Bank App')
        .setAudience(redirect_uri)
        .sign(privateKey);

    // generate refresh_token
    const refresh_token = await new jose.SignJWT({ refresh: true })
        .setProtectedHeader({ alg: alg })
        .setIssuedAt()
        .setExpirationTime('30d')
        .setIssuer('Bank App')
        .setAudience(redirect_uri)
        .sign(privateKey);

    const secret = jose.base64url.decode(secretObject.g1t4SymmetricKey)
    const encrypted_access_token = await new jose.EncryptJWT({ role, access_token })
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .encrypt(secret)
    
    // update into auth_code table
    await connection.execute("UPDATE auth SET access_token=?, id_token=?, refresh_token=? where id=?", [encrypted_access_token, id_token, refresh_token, auth_code_id]);

    const response = {
        statusCode: 301,
        headers: {
            Location: `${redirect_uri}/mybank?${stringified_params}`
        }
    };

    return response;
};
