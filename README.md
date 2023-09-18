# 💻 ITSA G1T4 

# Background
Authentication Service yielding the following features:
1. Enrollment - enrol account and verify account ownership
2. JWT Authentication - User Authentication using Hosted Login or Bank SSO
3. Acess Control Management - manage users roles and respective permissions
4. JWKS Endpoints - other servers can retrieve personal public key for message encryption etc.

# Architecture
![architecture-diagram-architecture with events-2](https://user-images.githubusercontent.com/106381214/229936525-c655960e-7fd1-428e-b244-8dbb1cc86ad4.jpg)

# CI/CD 
## Frontend
![unnamed-7](https://user-images.githubusercontent.com/106381214/229936985-0f348c76-6825-4803-83c9-a534214ce9ef.png)

## Backend
![bacckend](https://user-images.githubusercontent.com/106381214/229936931-b62b11fe-7fb9-4a4f-bab1-2aff48944a1d.png)

# Quality Attributes
## INTEROPERABILITY
The JWT claims in our system follow the OAuth standard for OIDC, ensuring compatibility with other systems. The authentication endpoint, request parameters, and response in our system meet the OIDC standards, making it easy for other systems to integrate with our application. We have also made sure that our application requests user consent to allow access to their profile information, ensuring compliance with privacy regulations. 
We have configured JWT authorizer in our API Gateway which uses the bank’s public key to verify the signature of the JWT. The JWT authorizer then verifies the JWT claims, and creates an API Gateway context that includes the user identity and any additional claims in the JWT, which can be used to authorise access to the protected resources.

## RESILIENCE & RECOVERY 
Our system architecture uses mostly serverless AWS services which are inherently resilient and highly available. These services are loosely coupled and can be independently scaled and deployed. Serverless AWS services automatically manages the underlying computer infrastructure and automatically scales resources as needed. If a node or a data centre fails, these services automatically switch to another node or data centre without any impact on the application. 
As part of our disaster recovery plan, we have decided on employing a hot standby active/passive disaster recovery strategy. Hot standby sets up a full environment in another region but acts as a passive region only. Users are only directed to a single region and disaster recovery regions do not take traffic. When AWS services in a region goes down, Route 53 will perform region failover and be able to direct traffic to the passive region to take on the computational workload and handle the requests. 
In a hot standby active/passive strategy, failover from the primary to the standby environment is quick and seamless, typically taking only a few minutes. This minimises downtime and ensures that our application remains available to the customers.

## SCALABILITY 
Our authorization servers are hosted with Lambda which will allow us to easily scale up or down according to the number of requests received. Lambda will automatically create more instances of our function to handle the increased demand. As traffic decreases, Lambda will automatically scale down the number of instances to save resources. Our frontend application is hosted on S3 which automatically increases the total capacity to store more data when size of application increases. This ensures that S3 can store our application that will continue developing over time without any manual intervention. We use DynamoDB as our database service, and it can also automatically scale to handle varying amounts of traffic and demand. We set our DynamoDB to on-demand scaling, hence there is no upper limit to how much it can scale, allowing DynamoDB to scale up as high as needed to handle the number of requests coming in. We choose to have an on-demand scaling set for our DynamoDB service as we want to always be able to serve requests and not be limited by upper thresholds.

## DATA SECURITY
### PERSONAL INFORMATION
With regards to Business Management of Personal Information, informational access will, importantly, be role-based so that users and customers cannot access resources that they do not have permissions for. In addition, to prevent access of Personal Information by third party malicious actors, Amazon RDS will encrypt data with keys that are managed using the AWS Key Management Service (KMS), which can only be obtained via usage of JWKS. In addition, JWKS will be implemented with additional IAM roles so as to ensure that only authorised backend users of the system can access the keys, further tightening overall access and reducing the total number of threats. All data concerned with Personal Information, be it backups or screenshots, will be encrypted.
From Customer Management, Customers will have the permission to delete their own data with "Erase My Account", which permanently drops all of their personal information from the database that they have entered to use the service. This functionality which we will implement gives Customers agency over their own personal information.

### SYSTEM SECURITY
Adopting a “Assume breach” mindset in the areas of detection, monitoring, and alerting, we will be using AWS CloudWatch to observe and monitor resources and applications on AWS and trigger AWS CloudWatch events to respond to these operational changes and take corrective action as necessary, by sending messages to respond to the environment, activating functions, making changes, alerts and capturing state information. AWS Cloud Trail will be our primary logging system, as it is integrated with most of our systems. It allows us to capture records of AWS account activities, delivering and storing these events in S3 and we can validate the integrity of CloudTrail log files stored in the S3 bucket and detect whether the log files were unchanged, modified, or deleted. Cloudtrail automatically encrypts the logs files. 
For AWS IAM, we use the implement least privilege access model, granting permissions to who is getting what permissions to which Systems Manager resources. Allowing the minimum required actions that users are allowed on those resources. AWS WAF will protect us against common web exploits and bots with the security rules we have created.
AWS KMS will be managing our keys, it provides us with centralised control over the lifecycle and permissions of our keys. Amazon API Gateway we will be enabling the CORS protection and requests are restricted to only valid  clients/sources and requests are authorised based on our configured authorizers. 

------------------------------------------------------------------------------------------------------------------------------
# Cloud Deployment

The main branch is used during our local development and for our client app.

Visit our site [here](https://itsag1t4.com)

# Local development

Setting up

1️⃣ Clone our repository from GitHub to your `desired_folder_name`

`git clone https://github.com/cs301-itsa/project-2022-23t2-project-2022-23t2-g1-t4.git desired_folder_name`

2️⃣ You will have to set up an OAuth app in http://smurnauth-production.fly.dev with credentials:

username: admin@example.com	

password: admin_password

the redirect should https://3qhkw6bpzk.execute-api.ap-southeast-1.amazonaws.com/default/bank


3️⃣ Edit the database password spring.datasource.password according to your system settings

~/project-2022-23t2-project-2022-23t2-g1-t4/server/src/main/resources/application.properties

# Running the application

4️⃣ Open a new terminal and perform the commands below to install the required dependencies for the frontend and run the frontend app

cd ~/project-2022-23t2-project-2022-23t2-g1-t4/frontend
npm install 
npm run dev

# Trying out the application

❕ SSO Login

Select any user in the file that can be found in the excel sheet below: data/Project A - users.xlsx
The password is "password"

❕ Hosted Login

You can log in as admins with the following users:


superadmin (read/write):	nicolas.kihn@dietrich.net	password

admin (read only):	waltraud_ondricka@oreilly.org	password

You can enroll any user in the excel: data/Project A - users.xlsx except the two admins above.
