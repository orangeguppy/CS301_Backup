// ##################################
// # Refresh Token Generation Flows #
// ##################################
// Import required packages
const jose = require('jose');
const aws = require('aws-sdk');
const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    
    // Check if cookie is expired
    if (!event.headers.cookie) {
        const response = {
            statusCode: 401,
            headers: {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Content-Type": "text/plain"
            },
            body: "Your access has expired. Please re-login at https://itsag1t4.com to view the resources."
        };
        return response;
    }

    // Retrieve database credentials    - done
    const rdsSecretName = "prod/rds-client-credentials";
    const rdsConfig = { region : "ap-southeast-1" };
    const rdsSecretsManager = new aws.SecretsManager(rdsConfig);
    const rdsSecretValue = await rdsSecretsManager.getSecretValue({SecretId: rdsSecretName}).promise();
    const rdsSecretObject = JSON.parse(rdsSecretValue.SecretString);
    
    // Retrieve JWT credentials         - done
    const jwtSecretName = "prod/keys";
    const jwtConfig = { region : "ap-southeast-1" };
    const jwtSecretsManager = new aws.SecretsManager(jwtConfig);
    const jwtSecretValue = await jwtSecretsManager.getSecretValue({SecretId: jwtSecretName}).promise();
    const jwtSecretObject = JSON.parse(jwtSecretValue.SecretString);

    // Establish connection with rds    - done
    const connection = await mysql.createConnection({   
        host: rdsSecretObject.host,         
        user: rdsSecretObject.username,                 
        password: rdsSecretObject.password,            
        database: rdsSecretObject.dbname                
    });                                                 

    // Retrieve refresh token from cookie  -  done
    // const client_refresh_token = JSON.parse(event.body)["refresh-token"];
    const client_refresh_token = (event.headers.cookie).substring(14);
   
    const client_refresh_token_info = jose.decodeJwt(client_refresh_token);                                                                                               
    const user_id = client_refresh_token_info.id;
    const email = client_refresh_token_info.email;
    
    // // Retrieve refresh token from database  - done
    const [rows1] = await connection.execute("SELECT * FROM auth where refresh_token=?", [client_refresh_token]); 
     
    // Refresh token not found ##################################################################################
    if (rows1.length === 0) {
        const response = {
            statusCode : 400,
            body : JSON.stringify({error: "invalid_refresh_token"})
        };
        return response;
    }

    // Refresh token found ######################################################################################
    const { id: auth_id, redirect_uri } = rows1[0];

    // Configuration for token generation   - done
    const alg = 'RS256';
    const privateKey = await jose.importPKCS8(jwtSecretObject.g1t4AsymmetricKey, alg); 
    
    // Retrieve required information for token generation
    
    // 1. Generate new access token         - done
    const new_access_token = await new jose.SignJWT({ user: { user_id, email } })
        .setProtectedHeader({ alg: alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .setIssuer('Bank App')
        .setAudience(redirect_uri)
        .sign(privateKey);
    
    // 2. Generate new refresh token        - done
    const new_refresh_token = await new jose.SignJWT({ id: user_id, email })
        .setProtectedHeader({ alg: alg })
        .setIssuedAt()
        .setExpirationTime('30d')
        .setIssuer('Bank App')
        .setAudience(redirect_uri)
        .sign(privateKey);
        
    // 3. Generate new id token             - done
    const [rows] = await connection.execute("SELECT role FROM users where email=?", [email]);                   
    const {role} = rows[0];   
    const new_id_token = await new jose.SignJWT({role, email})
        .setProtectedHeader({ alg: alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .setIssuer('Bank App')
        .setAudience(redirect_uri)
        .sign(privateKey);
        
    // Encrypt new access token             - done
    const secret = jose.base64url.decode(jwtSecretObject.g1t4SymmetricKey);
    const new_encrypted_access_token = await new jose.EncryptJWT({ role, new_access_token })
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .encrypt(secret);

    // Update rds                           - done
    await connection.execute("UPDATE auth SET access_token=?, id_token=?, refresh_token=? where id=?", [new_encrypted_access_token, new_id_token, new_refresh_token, auth_id]);  
    
    // Define cookie lifetime
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    const expiryDatetime = "expires=" + date.toUTCString();
    
    // Return new refresh token, new id token, new access token - done
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Set-Cookie": `refresh-token=${new_refresh_token}; Expires=${expiryDatetime};`,                                             // HttpOnly; SameSite=Strict; Secure
        },
        body: JSON.stringify({"access-token": new_access_token, "id-token": new_id_token})
    };
    return response;
};
