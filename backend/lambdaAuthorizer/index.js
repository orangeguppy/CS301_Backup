import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import * as jose from 'jose';

export const handler = async(event) => {
    // Declare policy variable to store the IAM policy returned
    let iamPolicy = null;
    
    // Get the keys for decryption and verification
    const keySecret = await getSecret("prod/keys");
    const keys = await getKeys(keySecret);

    // Get available api permissions to generate the IAM Policy later
    const apiSecret = await getSecret("prod/api_permissions");
    const apiPermissions = JSON.parse(apiSecret["api_permissions_v2"]);

    // Obtain the token(role, access_token) within the header
    //const authToken = event["access_token"]; // for testing in lambda
    const authToken = event.authorizationToken; // for testing with api gateway
    
    // Decrypt the token(role, access_token)
    const decryptedToken = await jose.jwtDecrypt(authToken, keys.symmetricKey);
    
    // Extract the access token from the decrypted token
    const payload = decryptedToken["payload"];
    const accessToken = payload["access_token"];
    const role = payload["role"];
    
    // Verify the JWT access token and get the user id. 
    // An error will be thrown by the method if verification fails.
    const id = await verifyJwt(keys, accessToken);
    
    // Generate the policy for that role
    iamPolicy = await generatePolicy(id, role, apiPermissions, accessToken);
    iamPolicy.context.id = id;
    // iamPolicy.context.methodArn = event.methodArn;
    return iamPolicy;
};

// ************************************************************** // 
// ********************** FUNCTIONS ***************************** //
// ************************************************************** //
async function getSecret(secretName) {
    // Create a client for connecting to the secrets manager
    const client = new SecretsManagerClient({
        region: "ap-southeast-1"
    });

    let response;
    // Send a request to the Secrets Manager
    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT" // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
    } catch (error) {
      const response = {
          statusCode: 500,
          body: JSON.stringify('Failed to retrieve secret.'),
      };
        return response;
    }
    // Return the secret as a JSON.
    return JSON.parse(response.SecretString);
}

async function getKeys(secret) {
    const keys = {
        symmetricKey: "",
        publicKey: [],
    };
    keys.symmetricKey = jose.base64url.decode(secret["g1t4SymmetricKey"]);
    keys.publicKey.push(secret["g1t4AsymmetricPubKey"]);
    keys.publicKey.push(secret["bankPublicKey"]);
    return keys;
}

async function verifyJwt(keys, decrypAccessToken) {
    // GENERATE PUBLIC KEY
    const alg = 'RS256';
    let id;
    for (const spki of keys.publicKey) {
        const publicKey = await jose.importSPKI(spki, alg);
        // Verify the token, then identify the user id
        try {
            const payload = await jose.jwtVerify(decrypAccessToken, publicKey);
            console.log("payload after verfiying", payload);
            id = payload["payload"]["user"]["id"];
            break;
        } catch (error) {
            console.log(error);
        }
    }
    return id;
}

async function returnDenyAllPolicy(id) {
    return {
        "principalId": id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Deny",
                    "Resource": "*"
                }
            ]
        }
    };
}

async function generatePolicy(principalId, role, apiPermissions, accessToken) {
    // Check if the user role is valid (isn't empty and matches the name of a valid role)
    const roleValid = await validateRole(role);
    
    // If the role is invalid, deny all access to resources
    if (!roleValid) {
        const iamPolicy = await returnDenyAllPolicy(principalId);
        return iamPolicy;
    }
    
    // Else the user's role is valid. Generate a fully formed IAM policy
    // Contain the whole response.
    const authResponse = {};

    // Principal ID
    authResponse.principalId = principalId;

    // Policy Document
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = apiPermissions[role];
    authResponse.policyDocument = policyDocument;
    authResponse.context = {
        "AccessToken": accessToken,
    };
    return authResponse;
}

async function validateRole(userRole) {
    const roleSecret = await getSecret("prod/roles");
    const roles = JSON.parse(roleSecret["roles"]);
    
    // If the role is null, it is invalid.
    if (userRole == null) {
        return false;
    }
    
    // The role is not empty, check if its valid. Return true if it is.
    for (var role of roles) {
        if (userRole == role) {
            return true;
        }
    }

    // The rolename is not valid.
    return false;
}
