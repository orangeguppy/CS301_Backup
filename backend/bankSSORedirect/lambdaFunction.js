const querystring = require('querystring')

exports.handler = async (event) => {
    const client_id = process.env.client_id
    const redirect_uri = process.env.redirect_uri
    const bank_end_point = process.env.bank_end_point

    const params = {
        client_id: client_id, 
        redirect_uri: redirect_uri,
        response_type: "code",
        scope: "openid profile"
    };

    const stringified_params = querystring.stringify(params)

    const response = {
        statusCode: 301,
        headers: {
            Location: `${bank_end_point}/oauth/authorize?` + stringified_params
        }
    };
    
    return response;
};