import pymysql
import boto3
from botocore.exceptions import ClientError
import sys
import os
import json
import datetime
import re

# Initialise variables for connecting to the database.
ENDPOINT = ""
USERNAME = ""
PASSWORD = ""
DATABASE_NAME = ""
PORT = 0
REGION = ""
os.environ['LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN'] = '1'

def lambda_handler(event, context):
    # Get database variables stored in AWS Secrets Manager
    get_secret()

    # Get the event body
    event_body = json.loads(event['body'])
    
    # Get the id of the updated user, and their new details
    id = event_body["id"]
    email = event_body["email"]
    first_name = event_body["first_name"]
    last_name = event_body["last_name"]
    print(email, first_name, last_name)
    
    # Validate input
    is_valid = validate(email, first_name, last_name)
    if (is_valid is False):
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": "Invalid input"
        }
    
    # Create session and client for connecting to the database
    session = boto3.session.Session()
    client = session.client('rds')
    
    # Query the database
    try:
        # Create a connection and query the database.
        conn =  pymysql.connect(host=ENDPOINT, user=USERNAME, passwd=PASSWORD, port=PORT, database=DATABASE_NAME, autocommit=True)
        cur = conn.cursor()
        cur.execute("""UPDATE users SET first_name = %s, last_name = %s, email = %s WHERE id = %s""", (first_name, last_name, email, id))
        conn.commit()
    except Exception as e:
        # Database connection failed. Return 500.
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": "Database connection failed due to {}".format(e)
        }
    finally:
        cur.close()
        conn.close()
    
    # Successful update. Return 200.
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": "User updated successfully."
    }

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
    
def validate(email, first_name, last_name):
    # Check email
    email_regex = '^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$'
    if (re.search(email_regex,email) is None):
        return False
    
    # Check name
    name_regex = "^[A-Z][a-z]+$"
    if (re.search(name_regex,first_name) is not None):
    else:
        return False
    
    # Check name
    if (re.search(name_regex, last_name) is not None):
    else:
        return False
    return True
