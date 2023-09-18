// To use the AWS Secret Manager -> For retrieving RDS credentials 
const AWS = require('aws-sdk')

const mysql = require('mysql2/promise');
const querystring = require('querystring')
const bcrypt = require('bcryptjs');

exports.lambdaHandler = async (event) => {    
  
    const secretName = "prod/rds-client-credentials";
    const config = { region : "ap-southeast-1" }
    let secretsManager = new AWS.SecretsManager(config);
    let secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
    const secretObject = JSON.parse(secretValue.SecretString)
    
    
    const { code_challenge, client_id, redirect_uri, code_challenge_method } = querystring.parse(event.body);

    // generate authorization code using code_challenge and code_challenge_method
    const salt = await bcrypt.genSalt(10);
    const auth_code = await bcrypt.hash(code_challenge+"."+code_challenge_method, salt);

    console.log("hello")
    // store auth_code in database
    const connection = await mysql.createConnection({
        host: secretObject.host,
        user: secretObject.username,
        password: secretObject.password,
        database: secretObject.dbname,
    });
    console.log("world")
  
    await connection.execute("INSERT INTO auth (auth_code, code_challenge, code_challenge_method, redirect_uri) VALUES (?, ?, ?, ?)", [auth_code, code_challenge, code_challenge_method, redirect_uri]);
    // get the latest id of the auth_code
    const [rows1] = await connection.execute("SELECT LAST_INSERT_ID() as id");
    const auth_code_id = rows1[0].id;

    // check if client_id and redirect_uri are the same in the database
    console.log('client id : ' + client_id)
    console.log('redirect_uri' + redirect_uri)
    const [rows2] = await connection.execute("SELECT * FROM client WHERE client_id=? AND redirect_uri=?", [client_id, redirect_uri ]);
    console.log("testing: " + rows2);
    if (rows2.length == 0) {
        return {
            statusCode: 301,
            headers: {
              Location: `https://${redirect_uri}/invalidlogin`
            },
            body: "Invalid client_id or redirect_uri"
        }
    }

    const loginPrompt = 
    `
    <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>User Consent & Credentials</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
          <style>
            body { padding-top: 50px; }
          </style>
        </head>
        <body>
        
          <div class="container" style="
            display: flex;
            justify-content: center;
            align-items: center;"
            >
            <form action="https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/hosted_login" method="post">
              <div class="container">
                <div style="margin:20px; ">
                  <label for="uname" style="display:block;"><b>Username</b></label>
                  <input type="text" placeholder="Enter Username" name="email" required>
                </div> 
        
                <div style="margin:20px; ">
                  <label for="psw" style="display:block;"><b>Password</b></label>
                  <input type="password" placeholder="Enter Password" name="password" required>
                </div>
                
                <input type="hidden" id="auth_code_id" name="auth_code_id" value="${auth_code_id}"/>
                
                <div style="margin:20px"> 
                  <button 
                    type="submit"
                    style="
                      background-color: #339DFF;
                      padding: 5px 30px;
                      margin: 10 0;
                      color: white;
                      border: 0;
                      border-radius: 5px;
                    "
                    >
                    Submit
                  </button>
        
                  <p width="10px" style="padding-top: 15px">
                    <span style="color: red">*</span>
                    By submitting this form, you are authorizing G1T4-AuthCodeExchange-1 to: <br>
                    1. Authenticate your account. <br>
                    2. View your account information.
                  </p>
                </div>
              </div>
            </form>
          </div>
            
        </body>
    </html>
    `
    
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: loginPrompt
    };
    
    return response;
};

