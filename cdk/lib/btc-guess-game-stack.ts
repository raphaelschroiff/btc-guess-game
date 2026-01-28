import { Schedule } from 'aws-cdk-lib/aws-applicationautoscaling';
import { AllowedMethods, CachePolicy, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { RestApiOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Rule } from 'aws-cdk-lib/aws-events';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BundlingOptions, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { Duration } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { CorsOptions, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

export class BtcGuessGameStack extends cdk.Stack {
  #lambdaBundlingOptions: BundlingOptions = {
    externalModules: ['@aws-sdk/*'],
  }

  #corsOptions: CorsOptions = {
    allowOrigins: ['http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
  }

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const btcGuessTable = new Table(this, 'BtcGuessTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiration',
    });

    const appBucket = new Bucket(this, 'BtcGuessGameAppBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const restApi = this.createApiGateWay(btcGuessTable);

    const distribution = new Distribution(this, 'BtcGuessGameDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(appBucket),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      },
      defaultRootObject: 'index.html',
      additionalBehaviors: {
        'api/*': {
          origin: new RestApiOrigin(restApi, {
            originPath: '/',
          }),
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: CachePolicy.CACHING_DISABLED,
        },
      },
    });

    const cfAccesspolicy = new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${appBucket.bucketArn}/*`],
      principals: [ ServicePrincipal.fromStaticServicePrincipleName('cloudfront.amazonaws.com')],
      conditions: {
        'StringEquals': {
          'AWS:SourceArn': distribution.distributionArn
        }
      }
    });

    appBucket.addToResourcePolicy(cfAccesspolicy);

    const fetchBtcPriceFunction = new NodejsFunction(this, 'FetchBtcPriceFunction', {
      entry: 'lambda/fetch-btc-price.ts',
      timeout: Duration.seconds(10),
      environment: {
        BTC_GUESS_TABLE_NAME: btcGuessTable.tableName,
      },
      logGroup: this.createLogGroup('FetchBtcPriceLogGroup'),
      bundling: this.#lambdaBundlingOptions,
    });
    btcGuessTable.grantWriteData(fetchBtcPriceFunction);

    const fetchBtcPriceRule = new Rule(this, 'FetchBtcPriceRule', {
      schedule: Schedule.rate(Duration.minutes(1)),
      targets: [new LambdaFunction(fetchBtcPriceFunction)],
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'AppBucketName', {
      value: appBucket.bucketName,
    });
  }

  createApiGateWay(table: Table): RestApi {
    const api = new RestApi(this, 'BtcGuessGameApi', {
      restApiName: 'BTC Guess Game Service',
      deployOptions: {
        stageName: 'api',
      },
    });

    const environmentVariables = {
      BTC_GUESS_TABLE_NAME: table.tableName,
      CORS_ALLOW_ORIGIN: this.#corsOptions.allowOrigins.join(','),
    };

    const getCurrentPriceFunction = new NodejsFunction(this, 'GetCurrentPriceFunction', {
      entry: 'lambda/api/getCurrentPrice.ts',
      environment: environmentVariables,
      logGroup: this.createLogGroup('GetCurrentPriceLogGroup'),
      bundling: this.#lambdaBundlingOptions,
    });
    table.grantReadData(getCurrentPriceFunction);

    const getUserFunction = new NodejsFunction(this, 'GetUserFunction', {
      entry: 'lambda/api/user/getUser.ts',
      environment: environmentVariables,
      logGroup: this.createLogGroup('GetUserLogGroup'),
      bundling: this.#lambdaBundlingOptions,
    });
    table.grantReadData(getUserFunction);

    const postUserFunction = new NodejsFunction(this, 'PostUserFunction', {
      entry: 'lambda/api/user/postUser.ts',
      environment: environmentVariables,
      logGroup: this.createLogGroup('PostUserLogGroup'),
      bundling: this.#lambdaBundlingOptions,
    });
    table.grantWriteData(postUserFunction);

    const postGuessFunction = new NodejsFunction(this, 'PostGuessFunction', {
      entry: 'lambda/api/user/postGuess.ts',
      environment: environmentVariables,
      logGroup: this.createLogGroup('PostGuessLogGroup'),
      bundling: this.#lambdaBundlingOptions,
    });
    table.grantReadWriteData(postGuessFunction);

    const getCheckResolvedFunction = new NodejsFunction(this, 'GetCheckResolvedFunction', {
      entry: 'lambda/api/user/getCheckResolved.ts',
      environment: environmentVariables,
      logGroup: this.createLogGroup('GetCheckResolvedLogGroup'),
      bundling: this.#lambdaBundlingOptions,
    });
    table.grantReadWriteData(getCheckResolvedFunction);

    const currentPrice = api.root.addResource('current-price')
    currentPrice.addMethod('GET', new LambdaIntegration(getCurrentPriceFunction))
    currentPrice.addCorsPreflight(this.#corsOptions);

    const user = api.root.addResource('user');
    user.addMethod('POST', new LambdaIntegration(postUserFunction));
    user.addCorsPreflight(this.#corsOptions);

    const userName = user.addResource('{userName}');
    userName.addMethod('GET', new LambdaIntegration(getUserFunction));
    userName.addCorsPreflight(this.#corsOptions);

    const guess = userName.addResource('guess')
    guess.addMethod('POST', new LambdaIntegration(postGuessFunction));
    guess.addCorsPreflight(this.#corsOptions);

    const checkResolved = userName.addResource('check-resolved');
    checkResolved.addMethod('GET', new LambdaIntegration(getCheckResolvedFunction));
    checkResolved.addCorsPreflight(this.#corsOptions);

    return api;
  }

  createLogGroup(name: string): LogGroup {
    return new LogGroup(this, name, {
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
