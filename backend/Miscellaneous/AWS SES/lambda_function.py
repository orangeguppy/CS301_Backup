import boto3
import json
from botocore.exceptions import ClientError

# Global variables for storing the AWS secret key credentials after fetching
# from Secrets Manager
AWS_ACCESS_KEY_ID = ''
AWS_SECRET_ACCESS_KEY = ''
REGION_NAME = ''

# Get the Secret with secret key credentials from the Secrets Manager
def get_secret():
    secret_name = "test/cs301/ses" # secret name
    region_name = "ap-southeast-1" # secret region is Singapore
    get_secret_value_response = ""

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    ) 

    # Get the content stored in the Secret
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    # Decrypts secret using the associated KMS key.
    secret = get_secret_value_response['SecretString']
    
    # Assign the secret key-value pairs to the global variables
    parse_secret(secret)

def parse_secret(string):
    # Access the global variables declared at lines 15-17
    global AWS_ACCESS_KEY_ID
    global AWS_SECRET_ACCESS_KEY
    global REGION_NAME

    # Convert the string to a JSON object
    data = json.loads(string)
    
    # Get the string values stored in the JSON object (access key ID, secret access key, region name)
    AWS_ACCESS_KEY_ID = data["aws_access_key_id"]
    AWS_SECRET_ACCESS_KEY = data["aws_secret_access_key"]
    REGION_NAME = data["region_name"]

# Call the Email Service using the AWS secret key
def lambda_handler(event, context):
    # Get and Store access key ID, the secret access key, and region name
    # in the global variables at lines 15-17
    get_secret()
    response = ""
    
    # Obtain the OTP inside the request
    OTP = event["OTP"]
    user_email = event["email"]
    
    # Sender and Receiver
    SENDER = "yxyohy@gmail.com"
    RECIPIENT = user_email
    
    # Set the content of the email message
    SUBJECT = "YOUR OTP IS..."
    BODY_TEXT = ""
    BODY_HTML = """<html>
    <head></head>
    <body>
    <h1>2FA OTP VERIFICATION</h1>
    <p>YOUR OTP IS {otp}</p>
    </body>
    </html>
                """.format(otp=OTP)
    CHARSET = "UTF-8"

    # Create an Email Service client with the access key ID, secret access key,
    # and region name stored in the global variables from lines 15-17
    client = boto3.client(
    'ses',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=REGION_NAME
    )

    try:
    #Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    RECIPIENT,
                ],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': BODY_HTML,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': BODY_TEXT,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
            },
            Source=SENDER,
        )
        # Display an error if something goes wrong.	
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])
    return {
        "statusCode": 200,
        "body": "Email sent! Message ID:" + response['MessageId']
    }
