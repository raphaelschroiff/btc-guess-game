import { Schedule } from 'aws-cdk-lib/aws-applicationautoscaling';
import { AllowedMethods, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Rule } from 'aws-cdk-lib/aws-events';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { Duration } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export class BtcGuessGameStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const appBucket = new Bucket(this, 'BtcGuessGameAppBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new Distribution(this, 'BtcGuessGameDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(appBucket),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      },
      defaultRootObject: 'index.html',
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

    const btcGuessTable = new Table(this, 'BtcGuessTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const fetchBtcPriceFunction = new NodejsFunction(this, 'FetchBtcPriceFunction', {
      entry: 'lambda/fetch-btc-price.ts',
      timeout: Duration.seconds(10),
      environment: {
        BTC_GUESS_TABLE_NAME: btcGuessTable.tableName,
      },
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
}
