const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const id = event.requestContext.authorizer.id
    const { email, first_name, last_name } = JSON.parse(event.body);

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

    await connection.execute("UPDATE users SET first_name=?, last_name=?, email=? where id=?", [first_name, last_name, email, id]);
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
            message: "User updated successfully",
        }),
    };
    return response;
};
