import { Schedule } from 'aws-cdk-lib/aws-applicationautoscaling';
import { AllowedMethods, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { RestApiOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Rule } from 'aws-cdk-lib/aws-events';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { Duration } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

export class BtcGuessGameStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const btcGuessTable = new Table(this, 'BtcGuessTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
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
          origin: new RestApiOrigin(restApi),
          allowedMethods: AllowedMethods.ALLOW_ALL,
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

    const getCurrentPriceFunction = new NodejsFunction(this, 'GetCurrentPriceFunction', {
      entry: 'lambda/api/getCurrentPrice.ts',
      environment: {
        BTC_GUESS_TABLE_NAME: table.tableName,
      },
      logGroup: this.createLogGroup('GetCurrentPriceLogGroup'),
    });
    table.grantReadData(getCurrentPriceFunction);

    const getUserFunction = new NodejsFunction(this, 'GetUserFunction', {
      entry: 'lambda/api/getUser.ts',
      environment: {
        BTC_GUESS_TABLE_NAME: table.tableName,
      },
      logGroup: this.createLogGroup('GetUserLogGroup'),
    });
    table.grantReadData(getUserFunction);

    const postUserFunction = new NodejsFunction(this, 'PostUserFunction', {
      entry: 'lambda/api/postUser.ts',
      environment: {
        BTC_GUESS_TABLE_NAME: table.tableName,
      },
      logGroup: this.createLogGroup('PostUserLogGroup'),
    });
    table.grantWriteData(postUserFunction);

    api.root.addResource('current-price').addMethod('GET', new LambdaIntegration(getCurrentPriceFunction));

    const user = api.root.addResource('user');
    user.addMethod('POST', new LambdaIntegration(postUserFunction));
    user.addResource('{userName}').addMethod('GET', new LambdaIntegration(getUserFunction));

    return api;
  }

  createLogGroup(name: string): LogGroup {
    return new LogGroup(this, name, {
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
