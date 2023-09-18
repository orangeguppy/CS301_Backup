const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const id = event.requestContext.authorizer.id

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

    await connection.execute("DELETE FROM users where id=?", [id]);
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
