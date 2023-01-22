import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as esbuild from 'esbuild';

export class AvatargenStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    esbuild.buildSync({
      entryPoints: ['func/avatargen.js'],
      bundle: true,
      minify: true,
      sourcemap: true,
      format: 'cjs',
      outfile: 'dist/avatargen/bundle.js',
      platform: 'node',
      target: 'node16',
      logLevel: 'info',
    });

    const handler = new lambda.Function(this, 'AvatarGenHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'avatargen/bundle.main',
      environment: {
        DEFAULT_AVATAR_SIZE: '128',
      },
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
