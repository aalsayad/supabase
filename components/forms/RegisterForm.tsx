'use client';

import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import { insertNewUserInDb, signUpWithEmailAndPassword } from '@/utils/supabase/actions/auth/actions';
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
  const supabase = createClient();
  const [formState, setFormState] = useState<FormState>({ status: 'idle', message: null });

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const handleEmailSignUp: SubmitHandler<z.infer<typeof registerSchema>> = async (formData) => {
    setFormState({ status: 'submitting', message: null });

    try {
      const user = await signUpWithEmailAndPassword(supabase, formData.email, formData.password, {
        name: formData.name,
      });
      if (!user) {
        setFormState({ status: 'error', message: 'Error has occured during sign up' });
      }
      if (user) await insertNewUserInDb(supabase, user, false);
      console.log('User added using signUp method & added to db as unverified 🟢');
      setFormState({ status: 'pending', message: 'Please check your inbox for verififcation' });
    } catch (error: any) {
      console.log(error.code);
      if (error.code === '23505') setFormState({ status: 'error', message: 'Email already registered' });
      else setFormState({ status: 'error', message: error.message || 'An Unknown error occurred' });
      return;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleEmailSignUp)} className='w-full'>
        {/* ------------------Form Header------------------ */}
        <div className=' flex items-center flex-col mb-[44px] md:mb-[48px] lg:mb-[52px]'>
          <GlowStar className='size-1.5 mb-4' />
          <h1 className='section-heading-3 text-center'>Register</h1>
          <p className='opacity-80 text-xs md:text-sm text-center'>Welcome to effekt client portal</p>
        </div>
        {/* ------------------Form Fields------------------ */}
        <div className='space-y-2 md:space-y-3 w-full'>
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
              <span className='absolute top-1 right-1 md:text-xs text-red-400'>{errors.confirmPassword?.message}</span>
            )}
          </div>
        </div>

        {/* Form State */}
        <div
          className={cn(
            'h-10 w-full flex items-center justify-center text-xs md:text-xs opacity-80 border-[1px]  rounded-lg my-1 md:my-2 lg:my-3',
            {
              'opacity-0': formState.status === 'idle' || formState.status === 'submitting',
              'opacity-100 bg-yellow/10 border-yellow/15 text-yellow': formState.status === 'pending',
              'opacity-100 bg-red-500/10 border-red-300/15 text-red-200': formState.status === 'error',
              'opacity-100 bg-green-500/10 border-green-300/15 text-green-200': formState.status === 'success',
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
            <Button type='primary'>Register</Button>
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
