'use client';

import { useEffect, useState } from 'react';
import {
  authSession,
  authSignOut,
  authSignIn,
  authCurrentUser,
  fetchAttributes,
} from '@/auth';
import type { AuthUser } from '@aws-amplify/auth';
import type { AuthUserAttributes } from '@aws-amplify/auth/dist/esm/types';

export default function Home() {
  const [user, setUser] = useState<AuthUser>();
  const [attributes, setAttributes] = useState<AuthUserAttributes>();

  useEffect(() => {
    (async () => {
      const session = await authSession();
      if (session.tokens) {
        setUser(await authCurrentUser());
        setAttributes(await fetchAttributes());
      } else {
        await authSignIn();
      }
    })();
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-screen max-w-screen-md mx-auto mt-8">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="w-20">Username:</div>
          <div>{user?.username}</div>
        </div>

        <div className="flex gap-2">
          <div className="w-20">User ID:</div>
          <div>{user?.userId}</div>
        </div>

        <div className="flex gap-2">
          <div className="w-20">Email:</div>
          <div>{attributes?.email}</div>
        </div>

        <div className="self-end">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={authSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
