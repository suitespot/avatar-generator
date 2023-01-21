import * as cdk from '@aws-cdk/core';
import { Construct } from 'constructs';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class AvatargenStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.NodejsFunction(this, 'AvatarGenHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('resources'),
      handler: 'avatargen.main',
      environment: {
        DEFAULT_AVATAR_SIZE: '128',
      },
    });

    new lambda.NodejsFunction(this, 'MyFunction', {
      entry: '/path/to/my/file.ts', // accepts .js, .jsx, .ts, .tsx and .mjs files
      handler: 'myExportedFunc', // defaults to 'handler'
    });

    const api = new apigateway.RestApi(this, 'AvatarGenAPI', {
      restApiName: 'AvatarGen Service',
      description: 'This service generates avatars.',
    });

    const getAvatarIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { 'application/json': `{ 'statusCode': '200' }` },
    });

    api.root.addMethod('GET', getAvatarIntegration, {
      operationName: 'GenerateAvatar',
      requestParameters: {
        'method.request.querystring.size': false,
        'method.request.querystring.name': true,
      }
    });
  }
}
