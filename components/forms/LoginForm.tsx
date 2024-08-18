'use client';

import { useRouter } from 'next/navigation';
import cn from '@/utils/general/cn';
import { useState } from 'react';
import * as z from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/utils/zod/schemas';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import { GlowStar } from '@/components/ui/Glowstar';
import { findUserInDbByEmail } from '@/utils/actions/serverActions';
import { signInWithEmailAndPassword, resendConfirmationToEmail } from '@/utils/actions/clientActions';
import { signInWithOAuth } from '@/utils/actions/serverActions';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import GithubLogo from '@/public/images/GithubLogo.svg';
import GoogleLogo from '@/public/images/GoogleLogo.svg';
import Image from 'next/image';
import { SelectUser } from '@/db/schema';

interface FormState {
  status: 'idle' | 'submitting' | 'pending' | 'success' | 'error';
  message: string | null;
}

type SetFormComponentType = React.Dispatch<React.SetStateAction<'login' | 'register' | 'forgotPassword'>>;

const LoginForm = ({ setFormComponent }: { setFormComponent: SetFormComponentType }) => {
  //Init Router & Supabase
  const router = useRouter();

  //Keep track of form state
  const [formState, setFormState] = useState<FormState>({ status: 'idle', message: null });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  //Init useForm
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email');
  const login: SubmitHandler<z.infer<typeof loginSchema>> = async (formData) => {
    setFormState({ status: 'submitting', message: '' });
    try {
      const user: SelectUser | null = await findUserInDbByEmail(formData.email);
      if (!user) {
        setFormState({ status: 'error', message: 'Account not found. Please register.' });
        return;
      }

      if (user?.provider !== 'email') {
        setFormState({
          status: 'error',
          message: `Email and password invalid. Please sign in with ${
            user?.provider.charAt(0).toUpperCase() + user?.provider.slice(1)
          }`,
        });
        return;
      }

      if (!user?.verified) {
        setFormState({
          status: 'pending',
          message: `Email not verified`,
        });
        return;
      }
      await signInWithEmailAndPassword(formData.email, formData.password);
      setFormState({ status: 'success', message: 'Logged in successfully' });
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.log(error);
      setFormState({ status: 'error', message: error.message });
    }
  };

  const handleResendConfirmation = async () => {
    try {
      await resendConfirmationToEmail(email);
      setFormState({ status: 'pending', message: 'Please check your inbox for verification' });
    } catch (error: any) {
      setFormState({ status: 'error', message: error.message });
    }
  };

  const handleGithubLogin = async function () {
    setFormState({ status: 'submitting', message: '' });
    console.log('Logging in with Github');
    try {
      await signInWithOAuth('github');
      setFormState({ status: 'submitting', message: 'Logging in through github' });
    } catch (e) {
      console.log('Error during github login:', e);
      setFormState({ status: 'error', message: `Failed to sign up with github` });
    }
  };
  const handleGoogleLogin = async function () {
    setFormState({ status: 'submitting', message: '' });
    console.log('Logging in with Google');
    try {
      await signInWithOAuth('google');
      setFormState({ status: 'submitting', message: 'Logging in through google' });
    } catch (e) {
      console.log('Error during github login:', e);

      setFormState({ status: 'error', message: `Failed to sign up with google` });
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(login)} className='w-full'>
        {/* ------------------Form Header------------------ */}
        <div className=' flex items-center flex-col mb-[44px] md:mb-[48px] lg:mb-[52px]'>
          <GlowStar className='size-1.5 mb-4' />
          <h1 className='section-heading-3 text-center'>Welcome back</h1>
          <p className='opacity-80 text-xs md:text-sm text-center'>Please sign in to continue</p>
        </div>
        {/* ------------------OAuth Buttons------------------ */}
        <div className='flex flex-col gap-2'>
          {/* login with OAuth */}
          <div onClick={handleGithubLogin} className='w-full'>
            <Button type='secondary'>
              <Image src={GithubLogo} className='w-4' alt='Github Logo' />
              Login in with Github
            </Button>
          </div>
          <div onClick={handleGoogleLogin} className='w-full'>
            <Button type='secondary'>
              <Image src={GoogleLogo} className='w-4' alt='Github Logo' />
              Login in with Google
            </Button>
          </div>
        </div>
        {/* ------------------Divider------------------ */}
        <div className='w-full h-[1px] bg-gradient-to-r from-grey10/0 via-white/15 to-grey10/0 mt-10 mb-6'></div>
        {/* ------------------Form Fields------------------ */}
        <div className='space-y-2 w-full'>
          {/* email Field */}
          <div className='relative'>
            <label className='form-label' htmlFor='email'>
              Email
            </label>
            <input
              className={cn('form-input', {
                'border-red-400/40 focus:border-red-400/40': errors.email,
              })}
              defaultValue=''
              {...register('email')}
            />
            {errors.email && (
              <span className='absolute top-1 right-1 md:text-xs text-red-400'>{errors.email?.message}</span>
            )}
          </div>
          {/* Password Field */}
          <div className='relative flex flex-col gap-1'>
            <label className='form-label' htmlFor='password'>
              Password
            </label>
            <input
              className={cn('form-input', {
                'border-red-400/40 focus:border-red-400/40': errors.password,
              })}
              type={showPassword ? 'string' : 'password'}
              defaultValue=''
              {...register('password')}
            />
            {!showPassword && (
              <EyeSlashIcon
                onClick={() => setShowPassword(true)}
                className='absolute right-2 bottom-9 w-4 cursor-pointer hover:opacity-100 opacity-40 transition-300'
              />
            )}
            {showPassword && (
              <EyeIcon
                onClick={() => setShowPassword(false)}
                className='absolute right-2 bottom-9 w-4 cursor-pointer opacity-90 transition-300'
              />
            )}

            {errors.password && (
              <span className='absolute top-1 right-1 md:text-xs text-red-400'>{errors.password?.message}</span>
            )}
            <div
              onClick={() => setFormComponent('forgotPassword')}
              className='self-end text-xs opacity-50 hover:opacity-100 cursor-pointer select-none mt-0.5'
            >
              Forgot your password?
            </div>
          </div>
        </div>
        {/* login Form Button */}
        <div className='w-full mt-6'>
          <button
            type='submit'
            className={cn('w-full', {
              'opacity-30 pointer-events-none': formState.status === 'submitting',
            })}
          >
            <Button type='primary'>
              <LockClosedIcon className='w-4' />
              Log in
            </Button>
          </button>
        </div>
        {/* Form State */}
        <div className='h-28 flex items-center justify-center'>
          <div
            className={cn(
              'py-3 w-full flex items-center justify-center text-xs md:text-xs opacity-80 border-[1px] rounded-[4px] my-1 md:my-2 lg:my-3',
              {
                'opacity-0': formState.status === 'idle' || formState.status === 'submitting',
                'opacity-100 bg-green-500/10 border-green-300/15 text-green-200': formState.status === 'success',
                'opacity-100 bg-red-500/10 border-red-300/15 text-red-200': formState.status === 'error',
                'opacity-100 bg-yellow/10 border-yellow/15 text-yellow': formState.status === 'pending',
              }
            )}
          >
            {formState.message}
            {formState.message === 'Email not verified' && (
              <>
                <div className='size-0.5 rounded-full bg-yellow mx-2'></div>
                <div
                  onClick={handleResendConfirmation}
                  className='flex items-center gap-1 font-medium underline cursor-pointer opacity-80 hover:opacity-100'
                >
                  Resend confirmation <ArrowUpRightIcon className='w-2' />
                </div>
              </>
            )}
          </div>
        </div>
        <div
          className={cn('space-y-2', {
            'opacity-30 pointer-events-none':
              formState.status === 'pending' || formState.status === 'submitting' || formState.status === 'success',
          })}
        ></div>
      </form>
    </>
  );
};

export default LoginForm;
