'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import { createClient } from '@/utils/supabase/client';
import debounce from 'lodash.debounce';
import { getAuthUser } from '@/utils/supabase/actions/auth/actions';

export default function AuthConfirmPage() {
  const supabase = createClient();
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  const [status, setStatus] = useState<string>('Verifying...');

  //Complete Sign up process from supabase auth
  const handleAuthCallBack = useCallback(
    debounce(async () => {
      try {
        //Fetch user from current session if available
        const user = await getAuthUser(supabase);
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

        //Get response from api/auth/callback - status/error/session
        const data = await response.json();

        if (response.ok) {
          if (data.session) await supabase.auth.setSession(data.session);
          setStatus(data.message || 'Verification successful');
          router.push('/');
          router.refresh();
        } else {
          setStatus(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error(error);
        setStatus(`Unexpected error occurred during verification:
          ${error}`);
      }
    }, 300),
    []
  );

  useEffect(() => {
    handleAuthCallBack();

    return () => {
      handleAuthCallBack.cancel();
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
