'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import { createClient } from '@/utils/supabase/client';
import debounce from 'lodash.debounce';

const getClient = async function () {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error(`Error encountered fetcing user session - ${error}`);
  console.log(user);
  return user;
};

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  const [status, setStatus] = useState<string>('Verifying...');
  console.log(token, email, code);

  //Verify user API endpoint async function
  const verifyUser = useCallback(
    debounce(async () => {
      try {
        const user = await getClient();
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
            code,
            sessionUser: user,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus(data.message || 'Verification successful');
          router.push('/');
          router.refresh();
        } else {
          setStatus(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('Unexpected error occurred during verification');
      }
    }, 300),
    []
  );

  useEffect(() => {
    verifyUser();

    return () => {
      verifyUser.cancel();
    };
  }, []);

  return (
    <Container fullscreen bordered first>
      <div>
        <h1>Account Verification</h1>
        <p>{status}</p>
      </div>
    </Container>
  );
}
