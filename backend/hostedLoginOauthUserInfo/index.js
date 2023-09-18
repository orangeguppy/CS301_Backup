const AWS = require('aws-sdk')
const mysql = require('mysql2/promise');

exports.handler = async (event) => {
    const id = event.context.id
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
    const [rows1] = await connection.execute("SELECT * FROM user where id=?", [id]);
    const response = {
        statusCode: 200,
        body: JSON.stringify(rows1[0]),
    };
    return response;
};
