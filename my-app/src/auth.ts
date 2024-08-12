import { Amplify } from 'aws-amplify';
import {
  type AuthSession,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from 'aws-amplify/auth';
import type { AuthConfig } from '@aws-amplify/core';
import type { AuthUser } from '@aws-amplify/auth';
import type { AuthUserAttributes } from '@aws-amplify/auth/dist/esm/types';

const authConfig: AuthConfig = {
  Cognito: {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? '',
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? '',
    loginWith: {
      oauth: {
        // DO NOT START WITH `https://`
        domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN ?? '',
        scopes: [
          'openid',
          'email',
          'profile',
          // Needed for the `fetchUserAttributes` function
          'aws.cognito.signin.user.admin',
        ],
        providers: [{ custom: 'Slack' }],
        // URLs must completely match the Cognito app client configuration including the trailing slash.
        redirectSignIn: ['http://localhost:3000/'],
        redirectSignOut: ['http://localhost:3000/'],
        responseType: 'code',
      },
    },
  },
};
Amplify.configure({ Auth: authConfig });

export async function authSession(): Promise<AuthSession> {
  return await fetchAuthSession();
}

export async function authCurrentUser(): Promise<AuthUser> {
  return await getCurrentUser();
}

export async function fetchAttributes(): Promise<AuthUserAttributes> {
  // This requires the `aws.cognito.signin.user.admin` scope.
  return await fetchUserAttributes();
}

export async function authSignIn(): Promise<void> {
  await signInWithRedirect({
    provider: { custom: 'Slack' },
  });
}

export async function authSignOut(): Promise<void> {
  await signOut();
}
