
# BTC Guess Game


BTC Guess Game is a web application where users predict the future price of Bitcoin. Users can guess whether the price will go up or down in the next minute. After 60 seconds, users can resolve their guess and get their score incremented if they were correct or decremented otherwise. The minimum score is always 0.

The backend is built with AWS Lambda, API Gateway, DynamoDB, and S3, using TypeScript and AWS CDK. The frontend is a Preact SPA built by Vite.



## Project Structure

This monorepo uses npm workspaces:
- **cdk/**: AWS infrastructure as code (CDK, Lambda, API Gateway, S3)
- **spa/**: Preact single page application (frontend)
- **bruno/**: API tests using Bruno
- **playwright/**: Playwright E2E tests


## Prerequisites

- Node.js and npm
- AWS account
- AWS CLI installed and configured (e.g., with AWS profiles)
- Bruno CLI (for API tests)



## Build & Deploy

1. **Install dependencies**
  ```
  npm install
  ```

2. **Deploy infrastructure**
  ```
  cd cdk
  npx cdk deploy --profile <aws profile>
  ```
  Replace `<aws profile>` as needed. After deployment, copy the `AppBucketName` output (S3 bucket for SPA).

3. **Build frontend**
  ```
  cd ../spa
  npm run build
  ```

4. **Deploy SPA**
  ```
  npm run deploy -- s3://<AppBucketName> --profile <aws profile>
  ```
  Replace `<AppBucketName>` and `<aws profile>` with your values. This uploads the build to S3.

5. **Invalidate CloudFront Distribution**
  It might be necessary to invalidate the CloudFront distribution to see the recent changes.
  ```
  aws cloudfront create-invalidation --distribution-id <DISTRIBUTION ID> --paths '/*' --profile <aws profile>


## API Tests

API tests are done using [Bruno](https://www.usebruno.com/). Install Bruno CLI:
```
npm install -g @usebruno/cli
```
Run tests (against production):
```
cd bruno
npm test
```

If you want to execute the tests against another URL, you can run:
```
bru run --env-var baseUrl=<URL> --env-var userName=<test user>
```

Or you can add your own environment file and run it with:
```
bru run --env-file ./environments/<your environment>.bru
```


## SPA (Frontend)

The `spa` directory contains the Preact frontend.

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


## Playwright E2E Tests

Execute the Playwright tests from the root of the project:
```
npx playwright test
```

If you want to see the tests running in the browser, run the tests in headed mode:
```
npx playwright test --headed
```

The tests are running against the production URL. If you want to run them against a different URL, you can change the baseURL in `playwright.config.ts`.
