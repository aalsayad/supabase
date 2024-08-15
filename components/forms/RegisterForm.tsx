'use client';

import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import { useRouter } from 'next/navigation';
import cn from '@/utils/general/cn';
import { useState } from 'react';
import * as z from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/utils/zod/schemas';
import Button from '@/components/ui/Button';
import { GlowStar } from '@/components/ui/Glowstar';

interface FormState {
  status: 'idle' | 'submitting' | 'pending' | 'error' | 'success';
  message: string | null;
}

const RegisterForm = () => {
  //Keep track of form state
  const [formState, setFormState] = useState<FormState>({ status: 'idle', message: null });
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');

  //Init Router & Supabase
  const router = useRouter();
  const supabase = createClient();

  //Init useForm
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  // Use `watch` to get the email value
  const name = watch('name');
  const email = watch('email');

  //Logic before sending OTP
  const preVerificationSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (formData) => {
    //Init Submitting
    setFormState({ status: 'submitting', message: null });

    //------------------Create a new user and wait for email verification------------------
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        },
      },
    });
    if (signUpError) {
      setFormState({ status: 'error', message: signUpError.message });
      return;
    }
    console.log('User added using signUp method');
    console.log('OTP sent');

    //------------------Add user to users database------------------
    const { error: insertError } = await supabase.from('users').insert([
      {
        authData: signUpData,
        name: formData.name,
        email: formData.email,
        supaAdmin: false,
        picture: null,
        verified: false,
      },
    ]);
    if (insertError) {
      if (insertError.code === '23505') setFormState({ status: 'error', message: 'Email already registered' });
      else setFormState({ status: 'error', message: insertError.message });
      return;
    }
    console.log('User added to db');

    //------------------Front End switch to OTP verification form------------------

    setIsOtpSent(true);
    setFormState({ status: 'idle', message: null });
  };

  //Logic After sending OTP
  const postVerificationSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (formData) => {
    // Init Submitting
    setFormState({ status: 'submitting', message: null });

    // Verify OTP
    const { data: verifyOtpData, error: verifyOtpError } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otp,
      type: 'email',
    });

    if (verifyOtpError) {
      setFormState({ status: 'error', message: verifyOtpError.message });
      return;
    }

    // Call your custom API to update the user's verified status
    try {
      const response = await fetch('/api/auth/update-user-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, authUserData: verifyOtpData.user }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      console.log('User verified:', result);
      setFormState({ status: 'success', message: 'Email verified' });
      router.refresh();
    } catch (error) {
      console.error('Update Error:', error);
      setFormState({ status: 'error', message: 'Error occurred during verification' });
    }
  };

  return (
    <>
      <form
        onSubmit={!isOtpSent ? handleSubmit(preVerificationSubmit) : handleSubmit(postVerificationSubmit)}
        className='w-full'
      >
        {/* ------------------Form Header------------------ */}
        <div className=' flex items-center flex-col mb-[44px] md:mb-[48px] lg:mb-[52px]'>
          <GlowStar className='size-1.5 mb-4' />
          <h1 className='section-heading-3 text-center'>Register</h1>
          <p className='opacity-80 text-xs md:text-sm text-center'>Welcome to effekt client portal</p>
        </div>
        {/* ------------------Form Fields------------------ */}
        <div className='space-y-2 md:space-y-3 w-full'>
          {!isOtpSent ? (
            <>
              {/* Name Field */}
              <div className='relative'>
                <label className='form-label' htmlFor='name'>
                  Name
                </label>
                <input
                  className={cn('form-input', {
                    'border-red-400/40 focus:border-red-400/40': errors.name,
                  })}
                  defaultValue=''
                  value={name}
                  {...register('name')}
                />
                {errors.email && (
                  <span className='absolute top-1 right-1 md:text-xs text-red-400'>{errors.name?.message}</span>
                )}
              </div>
              {/* Email Field */}
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
                  type='password'
                  defaultValue=''
                  {...register('password')}
                />

                {errors.password && (
                  <span className='absolute top-1 right-1 md:text-xs text-red-400'>{errors.password?.message}</span>
                )}
              </div>
              {/* Confirm Password Field */}
              <div className='relative'>
                <label className='form-label' htmlFor='password'>
                  Confirm Password
                </label>
                <input
                  className={cn('form-input', {
                    'border-red-400/40 focus:border-red-400/40': errors.confirmPassword,
                  })}
                  type='password'
                  defaultValue=''
                  {...register('confirmPassword')}
                />

                {errors.confirmPassword && (
                  <span className='absolute top-1 right-1 md:text-xs text-red-400'>
                    {errors.confirmPassword?.message}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {/* OTP Field */}
              <div className='relative'>
                <label className='form-label' htmlFor='name'>
                  OTP sent to {email}
                  <span
                    onClick={() => setIsOtpSent(false)}
                    className='inline-block opacity-50 cursor-pointer hover:opacity-100'
                  >
                    (Change?)
                  </span>
                </label>
                <input
                  className={cn('form-input', {})}
                  defaultValue=''
                  name='otp'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Form State */}
        <div
          className={cn(
            'h-10 w-full flex items-center justify-center text-xs md:text-xs opacity-80 border-[1px]  rounded-lg my-1 md:my-2 lg:my-3',
            {
              'opacity-0': formState.status === 'idle' || formState.status === 'submitting',
              'opacity-100 bg-yellow/10 border-yellow/15 text-yellow': formState.status === 'pending',
              'opacity-100 bg-red-500/10 border-red-300/15 text-red-200': formState.status === 'error',
            }
          )}
        >
          {formState.message}
        </div>
        {/* Form Submit Button & Form Switch Buttons */}
        <div className='w-full mb-1 md:mb-2'>
          <button
            type='submit'
            className={cn('w-full', {
              'opacity-30 pointer-events-none': formState.status === 'submitting' || formState.status === 'pending',
            })}
          >
            <Button type='primary'>{!isOtpSent ? 'Register' : 'Verify'}</Button>
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
