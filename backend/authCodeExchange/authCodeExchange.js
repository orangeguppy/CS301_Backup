const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const config = require('config');

const app = express();
const port = 5000; // replace with your desired port number
const redirectPort = 3000; 

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const authCode = req.query.code; // extract auth code from query string
  const client_id = config.get('client_id'); 
  const client_secret = config.get('client_secret'); 
  const bank_end_point = config.get('bank_end_point');
  const redirect_uri = `http://localhost:${port}`; // replace with your redirect URI

  const formData = {
    grant_type: 'authorization_code',
    code: authCode,
    client_id: client_id, 
    client_secret: client_secret, 
    redirect_uri: redirect_uri
  };

  request.post({ url: `${bank_end_point}/oauth/token`, formData }, (err, response, body) => {
    if (err) {
      return console.error(err);
    }
    console.log('BODY:', JSON.parse(body));
    //   redirect to frontend with the access token
    res.redirect(`http://localhost:${redirectPort}/accessToken?access_token=${JSON.parse(body).access_token}`);
  });

});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
