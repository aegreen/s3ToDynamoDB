# s3ToDynamoDB

## Sample application to create an S3 bucket, DynamoDB table, and Lambda function to copy files uploaded to an S3 bucket

Uses Serverless.com and node.js

## Serverless deployment creates:
- S3 bucket
- DynamoDB Table
- Lambda function that copies the file data from the S3 bucket into DynamoBD table

Uses uuid and aws-sdk node modules
Project includes serverless-upload-assets-to-s3 plugin to deploy the bucket and add the included json file

copy_to_dynamodb_plugin was created to trigger the lambda function that was created after deployment is complete

## Setup
Run the command below to add dependencies

```bash
npm install
```

Will require serverless install

## Deploy
Run the following command in order to deploy

```bash
serverless deploy
```
