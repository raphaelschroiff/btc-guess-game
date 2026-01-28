# BTC Guess Game

A litte guessing game about the development of the bitcoin price.

Developed for AWS with TypeScript and CDK.

## Project structure

This project is a monorepo using npm workspaces. The infrastructure is defined as code using AWS CDK (cdk workspace), and the frontend is implemented as a single page application using Preact (spa workspace).

## Prerequisites

To work with this project, you need to have Node.js and npm installed on your system. Additionally, you must have an AWS account and the AWS CLI installed and configured, for example by using AWS profiles.

## Build & deploy

First, install the dependencies by running `npm i`. To deploy the infrastructure, navigate to the `cdk` directory and execute `npx cdk deploy` (if you are using a specific AWS profile, add the `--profile <aws profile>` option). Follow the instructions provided during deployment.

After the deployment completes successfully, copy the value of the `AppBucketName` CloudFormation output. This is the name of the S3 bucket where the SPA will be deployed.

Next, go to the `spa` directory and build the frontend by running `npm run build`. To deploy the SPA, use the command `npm run deploy -- s3://<AppBucketName> --profile <aws profile>`, replacing `<AppBucketName>` and `<aws profile>` with your actual values.

## API Tests
For the API Tests [Bruno](https://www.usebruno.com/) is used. Intsall the CLI version of Bruno via `npm install -g @usebruno/cli``

To execute the tests go to the `bruno` directory and execute `npm test`

## SPA (Frontend)
The `spa` directory contains the preact frontend of the app.

To run the frontend locally:

1. Create a `.env` file in the `spa` directory and set the `VITE_BASE_URL` variable to your deployed CloudFront URL:
  ```
  VITE_BASE_URL=https://<your-cloudfront-domain>
  ```
  Replace `<your-cloudfront-domain>` with the actual CloudFront distribution URL from your deployment.

2. Install dependencies (if not already done):
  ```
  npm install
  ```

3. Start the development server:
  ```
  npm run dev
  ```

The SPA will be available at `http://localhost:5173` (or the port shown in your terminal).
