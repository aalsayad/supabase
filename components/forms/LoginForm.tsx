'use client';

import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import { useRouter } from 'next/navigation';
import cn from '@/utils/general/cn';
import { useState } from 'react';
import * as z from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/utils/zod/schemas';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { GlowStar } from '@/components/ui/Glowstar';
import { apiPost, VerifyUserResponse } from '@/utils/general/apiPost';
import { signInWithOAuth } from '@/utils/supabase/actions/auth/actions';

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
}

const LoginForm = () => {
  //Init Router & Supabase
  const router = useRouter();
  const supabase = createClient();

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

  //Logic to login a user or force OTP if not verified
  const login: SubmitHandler<z.infer<typeof loginSchema>> = async (formData) => {
    setFormState({ status: 'submitting', message: '' });
    try {
      //Check if there is an active session with a logged in user first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      //If there is an active session redirect to homepage
      if (user) {
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(formData);
      if (!error) {
        setFormState({ status: 'success', message: 'Logged in' });
        router.refresh();
        return;
      } else {
        if (error.message.includes('not confirmed')) {
          //Resend OTP again to user and grant him
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email: formData.email,
          });
          if (error) setFormState({ status: 'error', message: 'Failed to resend OTP to email' });
          setFormState({ status: 'idle', message: null });
        } else {
          setFormState({ status: 'error', message: error.message });
        }
      }
    } catch (e) {
      console.log('Server Error: ', e);
    }
  };

  const handleGithubLogin = async function () {
    setFormState({ status: 'submitting', message: '' });
    console.log('Logging in with Github');
    try {
      await signInWithOAuth(supabase, 'github');
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
      await signInWithOAuth(supabase, 'google');
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
        {/* ------------------Form Fields------------------ */}
        <div className='space-y-2 md:space-y-3 w-full'>
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
          <div className='relative'>
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
                className='absolute right-2 bottom-3.5 w-4 cursor-pointer hover:opacity-100 opacity-40 transition-300'
              />
            )}
            {showPassword && (
              <EyeIcon
                onClick={() => setShowPassword(false)}
                className='absolute right-2 bottom-3.5 w-4 cursor-pointer opacity-90 transition-300'
              />
            )}
            {errors.password && (
              <span className='absolute top-1 right-1 md:text-xs text-red-400'>{errors.password?.message}</span>
            )}
          </div>
        </div>

        {/* Form State */}
        <div
          className={cn(
            'h-10 w-full flex items-center justify-center text-xs md:text-xs opacity-80 border-[1px]  rounded-lg my-1 md:my-2 lg:my-3',
            {
              'opacity-0': formState.status === 'idle' || formState.status === 'submitting',
              'opacity-100 bg-green-500/10 border-green-300/15 text-green-200': formState.status === 'success',
              'opacity-100 bg-red-500/10 border-red-300/15 text-red-200': formState.status === 'error',
            }
          )}
        >
          {formState.message}
        </div>
        <div className='w-full mb-1 md:mb-2'>
          <button
            type='submit'
            className={cn('w-full', {
              'opacity-30 pointer-events-none': formState.status === 'submitting',
            })}
          >
            <Button type='primary'>Log in </Button>
          </button>
        </div>
        {/* login with OAuth */}
        <div onClick={handleGithubLogin} className='w-full mb-1 md:mb-2'>
          <Button type='secondary'>Login in with Github</Button>
        </div>
        <div onClick={handleGoogleLogin} className='w-full mb-1 md:mb-2'>
          <Button type='secondary'>Login in with Google</Button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
