import pymysql
import boto3
from botocore.exceptions import ClientError
import sys
import os
import json
from datetime import datetime

# Initialise variables for connecting to the database.
ENDPOINT = ""
USERNAME = ""
PASSWORD = ""
DATABASE_NAME = ""
PORT = 0
REGION = ""
lambda_client = boto3.client('lambda')

# Take in email and 6 digit otp and query rds to see if the otp match and 
# Also make sure that the otp is not expired

# If successful, update the rds status column to success
# Status Codes:
'''
    // 200: Good
    // 401: Invalid OTP
    // 402: Expired OTP
    // 403: Email not inside DB
    // 500: Other untold errors 
//
'''

# Initialise variables for connecting to the database.
ENDPOINT = ""
USERNAME = ""
PASSWORD = ""
DATABASE_NAME = ""
PORT = 0
REGION = ""

# function to read
def lambda_handler(event, context):
    # Get database variables stored in AWS Secrets Manager
    get_secret()
    
    #Takes in OTP 
    email = event['email']
    otp = event['otp']
    plaintext_pw = event['password']
    
    # Set up a client and session
    session = boto3.session.Session()
    client = session.client('rds')

    # Get the time now.
    currentTime = datetime.now()    #currentTime object

    try:
        conn =  pymysql.connect(host=ENDPOINT, user=USERNAME, passwd=PASSWORD, port=PORT, database=DATABASE_NAME)
        cur = conn.cursor()
    
        cur.execute("""SELECT otp, expiry from users WHERE email = %s""", email)
        query_results = cur.fetchall()
        
        #This check is when the EMAIL IS NOT INSIDE SINCE THE QUERY RETURNS NULL
        if (len(query_results) == 0):
            response = {
                "status": 403,
                "headers": {
                    "Access-Control-Allow-Headers" : "*",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    },
                "body": "EMAIL Not INCLUDED"
            }
            return response
        else:    
            retrievedOTP = query_results[0][0]
            retrievedTime = query_results[0][1]
            
            if (currentTime > retrievedTime ):
                print("The OTP has EXPIRED. DIE LIAO! SHOOT SHOOT BANG BANG BANG!")
                response = {
                    "status": 402,
                    "headers": {
                        "Access-Control-Allow-Headers" : "*",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "*",
                        },
                    "body": "OTP is EXPIRED"
                }
                return response
            
            else:
                if (int(retrievedOTP) == int(otp)): 
                    # OTP is valid and not expired
                    response = {
                        "status": 200,
                        "headers": {
                            "Access-Control-Allow-Headers" : "*",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "*",
                        },
                        "body": "OTP is valid and not expired"
                    }
                    # Update the user's status in the database
                    salt, hash_pw = hashPassword(plaintext_pw) 
                    cur.execute("""UPDATE users SET status = %s, salt = %s, hash_password = %s where email = %s""", ('active', salt, hash_pw, email))
                    conn.commit()
                    return response
                else:
                    # OTP is either invalid or expired
                    response = {
                        "status": 401,
                        "headers": {
                            "Access-Control-Allow-Headers" : "*",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "*",
                            },
                        "body": "OTP is invalid"
                    }
                    return response
    except Exception as e:
        print("Error connecting to database: ", e)
        response = {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": "Error connecting to database"
        }
        
    finally:
        cur.close()
        conn.close()
    return response

def hashPassword(password):
    lambda_client = boto3.client('lambda')
    lambda_payload = json.dumps({"password": password})
    response = lambda_client.invoke(FunctionName='hashPassword', 
                InvocationType='RequestResponse',
                Payload=lambda_payload)
    response_json = json.loads(response['Payload'].read())
    hashed_pw = response_json["hash"]
    salt = response_json["salt"]
    return salt, hashed_pw

def get_secret():
    secret_name = "prod/rds-client-credentials"
    region_name = "ap-southeast-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e

    # Decrypts secret using the associated KMS key.
    secret = get_secret_value_response['SecretString']
    parse_secret(secret)

def parse_secret(string):
    # Access the global variables declared at lines 15-17
    global ENDPOINT
    global USERNAME
    global PASSWORD
    global DATABASE_NAME
    global PORT
    global REGION

    # Convert the string to a JSON object
    data = json.loads(string)
    
    # Get the string values stored in the JSON object (access key ID, secret access key, region name)
    ENDPOINT = data["host"]
    USERNAME = data["username"]
    PASSWORD = data["password"]
    DATABASE_NAME = data["dbname"]
    PORT = data["port"]
    REGION = data["region"]
