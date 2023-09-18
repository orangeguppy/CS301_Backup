import pyotp
import secrets
import pymysql
from datetime import datetime, timedelta
import json
import boto3
from botocore.exceptions import ClientError

# Initialise variables for connecting to the database.
ENDPOINT = ""
USERNAME = ""
PASSWORD = ""
DATABASE_NAME = ""
PORT = 0
REGION = ""

def lambda_handler(event, context):
    # Get database variables stored in AWS Secrets Manager
    get_secret()

    # Generate a random secret key for the TOTP object
    currentTime = datetime.now()
    currentTime2 = currentTime + timedelta(seconds = 60) #UTC FOR NOW
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret, interval=300)

    # Generate an OTP
    otp = totp.now()
    print(f"OTP: {otp}")

    # Get the user's email
    event_body = json.loads(event['body'])
    email = event_body["email"]
    
    # Store OTP in database
    try:
        conn = pymysql.connect(host=ENDPOINT, user=USERNAME, passwd=PASSWORD, port=PORT, database=DATABASE_NAME)
        cur = conn.cursor()
        cur.execute("""UPDATE users SET otp = %s, expiry = %s WHERE email = %s""", (otp, currentTime2, email))
        conn.commit()
    except Exception as e:
        print(f"Error storing OTP in database: {e}")
        return {
            "statusCode": 500,
            "body": "Error storing OTP in database"
        }
    finally:
        cur.close()
        conn.close()

    # After generating and saving the OTP, invoke the simple email service lambda
    # to send the OTP to the user
    client = boto3.client('lambda') # create a client
    
    response = client.invoke(
        FunctionName = 'arn:aws:lambda:ap-southeast-1:123379395205:function:simpleEmailService',
        InvocationType = 'RequestResponse',
        Payload = json.dumps({"OTP": otp, "email": email})
    )

    responseFromChild = json.load(response['Payload'])
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": "OTP stored in database."
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
