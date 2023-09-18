const https = require('https');
const jose = require('jose');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
exports.handler = async (event, context, callback) => {
    const authCode = event.queryStringParameters.code; // extract auth code from request body
    console.log(authCode);
    
    // get rds credentials
    let secretName = "prod/rds-client-credentials";
    const config = { region : "ap-southeast-1" };
    let secretsManager = new AWS.SecretsManager(config);
    let secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
    let secretObject = JSON.parse(secretValue.SecretString);
    const connection = await mysql.createConnection({
        host: secretObject.host,
        user: secretObject.username,
        password: secretObject.password,
        database: secretObject.dbname
    });
    
    // get symmetric key for encryption
    secretName = "prod/keys";
    secretsManager = new AWS.SecretsManager(config);
    secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
    secretObject = JSON.parse(secretValue.SecretString);
    const g1t4SymmetricKey = secretObject.g1t4SymmetricKey;
    const bankPublicKey = await jose.importSPKI(secretObject.bankPublicKey, 'RS256');
    
    // get bank sso parameters
    secretName = "prod/banksso";
    secretsManager = new AWS.SecretsManager(config);
    secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
    secretObject = JSON.parse(secretValue.SecretString);
    const { client_id, client_secret, bank_end_point, redirect_uri, client_uri } = secretObject;

    const formData = {
        grant_type: 'authorization_code',
        code: authCode,
        client_id: client_id, 
        client_secret: client_secret, 
        redirect_uri: redirect_uri
    };

    const options = {
        hostname: bank_end_point,
        port: 443,
        path: `/oauth/token`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const promise = new Promise((resolve, reject) => {
        let data = '';
        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                data += d;
            });
            
            res.on('end', async () => {
                const parsedData = JSON.parse(data);
                const accessCode = parsedData.access_token;
                const { payload } = await jose.jwtVerify(accessCode, bankPublicKey);
                const userId = payload.user.id;
                const [rows1] = await connection.execute("SELECT role FROM users where id=?", [userId]);
                const { role } = rows1[0];

                const secret = jose.base64url.decode(g1t4SymmetricKey);
                const jwt = await new jose.EncryptJWT({ role: role, access_token: accessCode })
                    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
                    .setIssuedAt()
                    .setExpirationTime('1h')
                    .encrypt(secret);
                
                const redirectUrl = `${client_uri}?accessToken=${jwt}`;
                console.log(`Redirecting to ${redirectUrl}`);
                resolve({
                    statusCode: 301,
                    headers: {
                        Location: redirectUrl
                    }
                });
            });
        });

        req.on('error', (error) => {
            console.error(error);
            reject(error);
        });
    
        req.write(JSON.stringify(formData));
        req.end();
    });

    return promise;
};
