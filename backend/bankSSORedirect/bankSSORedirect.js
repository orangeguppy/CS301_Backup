const express = require('express')

const config = require('config')
const auth_code_request_credentials = config.get('auth_code_request_credentials')

const querystring = require('querystring')

const app = express()

const redirectPort = 5000
const port = 4000

// admin sign in credentials #######################################
// url link: https://smurnauth-production.fly.dev/users/sign_in
// username: admin@example.com
// password: password
// #################################################################

// http://localhost:3000
app.get('/', (req, res) => { res.send('bank sso login status: success') })

// http://localhost:4000/get-auth-code
app.get('/get-auth-code', (req, res) => {

  const client_id = auth_code_request_credentials.get('client_id'); 

  const bank_end_point = auth_code_request_credentials.get('bank_end_point');

  const redirect_uri = `http://localhost:${redirectPort}`; 

  const params = {
    client_id: client_id, 
    redirect_uri: redirect_uri,
    response_type: "code",
    scope: "openid profile"
  };

  const stringified_params = querystring.stringify(params)

  // redirect url #################################################
  // https://smurnauth-production.fly.dev/oauth/authorize?
  // client_id=cMZ8riSFzCrLUwDCkd3awhx5pFLURjW5th2aWfm13ws
  // &redirect_uri=http%3A%2F%2Flocalhost%3A3000
  // &response_type=code
  // &scope=openid+profile 
  // #################################################################  
  res.redirect(`${bank_end_point}/oauth/authorize?` + stringified_params)
})


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})