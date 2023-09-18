const mysql = require('mysql2/promise');
const AWS = require('aws-sdk')
const crypto = require('crypto-js');

exports.handler = async (event) => {
    const base64URL = (string) => {
        return string.toString(crypto.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    }
    const { code_verifier, client_id, client_secret, auth_code } = JSON.parse(event.body);
    // const { code_verifier, client_id, client_secret, auth_code } = event;
    // get code_challenge and code_challenge_method using auth_code
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
    const [rows1] = await connection.execute("SELECT * FROM auth where auth_code=?", [auth_code]);
    const { code_challenge, code_challenge_method, access_token, id_token, refresh_token } = rows1[0];
    // validate code_verifier
    if (code_challenge_method == 'S256') {
        const hashedInputCodeVerifier = base64URL(crypto.SHA256(code_verifier));
        if (hashedInputCodeVerifier != code_challenge) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'invalid_grant' })
            };
        }
    } else {
        if (code_verifier != code_challenge) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'invalid_grant' })
            };
        }
    }
    
    // validate client_id and client_secret
    const [rows2] = await connection.execute("SELECT * FROM client where client_id=?", [client_id]);
    console.log(rows2)
    const client_secret_db = rows2[0].secret;
    if (client_secret != client_secret_db) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'invalid_client' })
        };
    }

    // return access_token, id_token, refresh_token
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({ access_token, id_token, refresh_token })
    };
}
