'use client';
import { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import { createClient } from '@/utils/supabase/client';
import debounce from 'lodash.debounce';
import {
  findUserInDbByEmail,
  findUserInDbById,
  insertNewUserInDb,
  updateUserDbVerification,
} from '@/utils/actions/serverActions';
import { getCurrentClientSession, verifyAndLoginWithOtp } from '@/utils/actions/clientActions';
import { SelectUser } from '@/db/schema';
import { GlowStar } from '@/components/ui/Glowstar';
import cn from '@/utils/general/cn';
import Button from '@/components/ui/Button';

import Link from 'next/link';
import PasswordResetForm from '@/components/forms/PasswordResetForm';

type VerificationResultType = { message: string } | never;
const checkVerification = async (
  token?: string,
  email?: string,
  code?: string,
  type?: string
): Promise<VerificationResultType> => {
  console.log('Complete Login/Sign Up Flow');
  if (!token && !email && !code) throw Error('No search params provided');
  if (token && !email) throw Error('Email missing from search Params');
  if (!token && email) throw Error('Token missing from search Params');

  //@OAuth Flow Verififcation
  if (code) {
    const session: Session | null = await getCurrentClientSession();
    if (!session) throw Error('No current session active');
    if (!session.user) throw Error('Failed to retreive user from current session');
    const user = session.user;

    const userSbData: SelectUser | null = await findUserInDbById(user.id);
    //If user doesn't exsist in users table add the user as verified
    if (!userSbData) {
      await insertNewUserInDb(user, true);
      return { message: 'User added to users table as verified' };
    }
    //If user exsists in users table check verification
    if (userSbData?.verified) return { message: 'User already verified in users table' };
    if (!userSbData?.verified) {
      await updateUserDbVerification(user.id, user);
      return { message: 'User just verified in users table' };
    }
  }

  //@SignUp Flow Verification
  if (token && email && !type) {
    const user = await verifyAndLoginWithOtp(email, token);
    if (!user) throw Error('User Verified but no user data could be retreived');

    await updateUserDbVerification(user.id, user);
    return { message: 'User Added & verified in users db' };
  }

  //@PasswordReset Flow Verification
  if (token && email && type === 'password-reset') {
    const user = await verifyAndLoginWithOtp(email, token);
    if (!user) throw Error('Token verified but user was retreived');

    return { message: 'Success, please enter your password' };
  }

  throw Error('Unexpected Error has occured during the password reset process');
};

export default function AuthConfirmPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const email = searchParams.get('email') || undefined;
  const code = searchParams.get('code') || undefined;
  const type = searchParams.get('type') || undefined;

  const [verificationState, setVerificationState] = useState<{
    status: 'verifying' | 'success' | 'error' | 'pending';
    message: string;
  }>({
    status: 'verifying',
    message: 'Please hang tight as we verify your account',
  });

  //Complete Sign up process from supabase auth
  const handleAuthCallBack = useCallback(
    debounce(async () => {
      try {
        const response = await checkVerification(token, email, code, type);

        if (response.message && type !== 'password-reset') {
          setVerificationState({ status: 'success', message: 'Verification Complete, Logged in' });
          router.push('/');
          router.refresh();
        } else if (response.message && type === 'password-reset') {
          setVerificationState({ status: 'pending', message: 'Token Verified. Please reset your password.' });
          router.refresh();
        } else {
          setVerificationState({ status: 'error', message: response.message || 'Verification failed' });
        }
      } catch (error: any) {
        console.error(error);
        setVerificationState({ status: 'error', message: error.message || 'Verification failed' });
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
    <Container fullscreen bordered={false} first>
      <div className='w-full h-full flex items-center justify-center'>
        <div className='h-fit flex flex-col items-center p-2 md:p-4 lg:p-6 py-8 md:py-10 lg:py-12 rounded-lg md:rounded-xl lg:rounded-2xl border-[1px] border-grey10 w-full max-w-[450px] bg-[rgb(255,255,255,0.01)]'>
          <div
            className={cn('flex items-center flex-col mb-[44px] md:mb-[48px] lg:mb-[52px]', {
              'mb-0 md:mb-0 lg:mb-0': verificationState.status === 'pending',
            })}
          >
            <GlowStar className='size-1.5 mb-4' />
            <h1 className='section-heading-3 text-center'>
              {type === 'password-reset' ? 'Password Reset' : 'Logging in'}
            </h1>
            <p className='opacity-80 text-xs md:text-sm text-center'>
              {verificationState.status === 'pending'
                ? 'Please enter your new password'
                : 'Please hang tight as we verify your account'}
            </p>
          </div>
          <div>
            {verificationState.status === 'pending' ? (
              <PasswordResetForm />
            ) : (
              <p
                className={cn(
                  'opacity-80 text-xs md:text-sm text-center w-fit px-5 py-1.5 border-[1px] rounded-md mb-3',
                  {
                    'opacity-100 bg-yellow/10 border-yellow/15 text-yellow': verificationState.status === 'verifying',
                    'opacity-100 bg-red-500/10 border-red-300/15 text-red-200': verificationState.status === 'error',
                    'opacity-100 bg-green-500/10 border-green-300/15 text-green-200':
                      verificationState.status === 'success',
                  }
                )}
              >
                {verificationState.message}
              </p>
            )}

            {verificationState.status === 'error' && (
              <Link href='/auth'>
                <Button type='secondary' className='w-full' chevron>
                  Back to Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
