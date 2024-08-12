import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import {
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
  UserPoolIdentityProviderOidc,
} from 'aws-cdk-lib/aws-cognito';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class CdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps & {
      slackSecretArn: string;
      cognitoDomainPrefix: string;
    },
  ) {
    super(scope, id, props);

    // Cognito User Pool
    const userPool = new UserPool(this, 'user-pool', {
      userPoolName: 'sign-in-with-slack-user-pool',
    });

    // Cognito User Pool Domain
    new UserPoolDomain(this, 'user-pool-domain', {
      userPool,
      cognitoDomain: {
        domainPrefix: props?.cognitoDomainPrefix ?? '',
      },
    });

    // Cognito User Pool Client
    new UserPoolClient(this, 'user-pool-client', {
      userPool,
      userPoolClientName: 'client',
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        callbackUrls: [
          'https://example.com/', // Cognito app client default
          'http://localhost:3000/',
        ],
        logoutUrls: ['http://localhost:3000/'],
        scopes: [
          OAuthScope.OPENID,
          OAuthScope.EMAIL,
          OAuthScope.PROFILE,
          OAuthScope.COGNITO_ADMIN,
        ],
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.custom('Slack'),
      ],
    });

    // Slack app credentials stored in your Secrets Manager
    const slackSecret = Secret.fromSecretCompleteArn(
      this,
      'slack-secret',
      props?.slackSecretArn ?? '',
    );

    // Cognito User Pool Identity Provider (OIDC)
    new UserPoolIdentityProviderOidc(this, 'slack-oidc', {
      userPool,
      name: 'Slack',
      clientId: slackSecret
        .secretValueFromJson('clientId')
        .unsafeUnwrap()
        .toString(),
      clientSecret: slackSecret
        .secretValueFromJson('clientSecret')
        .unsafeUnwrap()
        .toString(),

      // See https://api.slack.com/authentication/sign-in-with-slack#request
      // > Which permissions you want the user to grant you.
      // > Your app will request openid, the base scope you always need to request in any Sign in with Slack flow.
      // > You may request email and profile as well.
      scopes: ['openid', 'email', 'profile'],

      // See https://api.slack.com/authentication/sign-in-with-slack#discover
      issuerUrl: 'https://slack.com',

      // The following endpoints do not need to be configured because the Cognito can find them by the issuer url.
      // endpoints: {
      //   authorization: 'https://slack.com/openid/connect/authorize',
      //   token: 'https://slack.com/api/openid.connect.token',
      //   userInfo: 'https://slack.com/api/openid.connect.userInfo',
      //   jwksUri: 'https://slack.com/openid/connect/keys',
      // },

      attributeMapping: {
        email: ProviderAttribute.other('email'),
        profilePage: ProviderAttribute.other('profile'),
      },
    });
  }
}
