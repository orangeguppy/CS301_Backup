import bcrypt from 'bcryptjs';

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const handler = async(event) => { 
    const salt = await bcrypt.genSalt();
    const password = event["password"];
    const hashedInputPassword = await bcrypt.hash(password, salt);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        hash: hashedInputPassword,
        salt: salt
    }
};
