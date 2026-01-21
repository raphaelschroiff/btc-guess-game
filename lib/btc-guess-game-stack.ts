import { AllowedMethods, Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

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

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'AppBucketName', {
      value: appBucket.bucketName,
    });
  }
}
