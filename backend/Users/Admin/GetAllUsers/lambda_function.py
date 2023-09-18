import pymysql
import boto3
from botocore.exceptions import ClientError
import sys
import os
import json
import datetime

ENDPOINT = ""
USERNAME = ""
PASSWORD = ""
DATABASE_NAME = ""
PORT = 0
REGION = ""
os.environ['LIBMYSQL_ENABLE_CLEARTEXT_PLUGIN'] = '1'

def lambda_handler(event, context):
    # Retrieve database connection credentials from AWS Secrets Manager
    get_secret()
    
    # Create new session and client for connecting to the database
    session = boto3.session.Session()
    client = session.client('rds')
    query_results = ""
    # Query the database for all users
    try:
        conn =  pymysql.connect(host=ENDPOINT, user=USERNAME, passwd=PASSWORD, port=PORT, database=DATABASE_NAME)
        cur = conn.cursor()
        cur.execute("""SELECT id, email, first_name, last_name, status, birthdate, role FROM users""")
        query_results = cur.fetchall()
    except Exception as e:
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
        
    print(query_results)
    res = []
    for x in query_results:
        res.append({
            "email": x[1],
            "given_name": x[2],
            "family_name": x[3],
            "name": x[2] + " " + x[3],
            "birthdate": x[5],
            "id": x[0],
            "status": x[4]
        })
    print(res)
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps(res)
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
