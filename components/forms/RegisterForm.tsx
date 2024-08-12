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
  status: 'idle' | 'submitting' | 'pending' | 'error';
  message: string | null;
}

const RegisterForm = () => {
  //Init Router & Supabase
  const router = useRouter();
  const supabase = createClient();

  //Keep track of form state
  const [formState, setFormState] = useState<FormState>({ status: 'idle', message: null });

  //Init useForm
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  //Submit Login Form Function
  const onSubmit: SubmitHandler<z.infer<typeof registerSchema>> = async (formData) => {
    //Check if signed up is supaAdmin (only for effekt.design domains)
    const emailDomain = formData.email.split('@')[1];
    const isEffektDesign = emailDomain === 'effekt.design';

    //Init Submitting Status
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

      // Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
          data: {
            name: formData.name,
            supaAdmin: isEffektDesign,
          },
        },
      });
      if (signUpError) {
        setFormState({ status: 'error', message: signUpError.message });
        return;
      }
      console.log('User Signed Up');

      //Add user to users database
      const { data: insertData, error: insertError } = await supabase.from('users').insert([
        {
          authData: signUpData,
          name: formData.name,
          email: formData.email,
          supaAdmin: isEffektDesign,
          picture: null,
        },
      ]);

      if (insertError) {
        if (insertError.code === '23505') setFormState({ status: 'error', message: 'Email already registered' });
        else setFormState({ status: 'error', message: insertError.message });
        return;
      }

      setFormState({ status: 'pending', message: 'Confirmation link sent to your email' });
      console.log('User Added to db: ', insertData);
      router.refresh();
      return;
    } catch (e) {
      console.log('Server Error: ', e);
      setFormState({ status: 'error', message: 'Server Error' });
      return;
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <div className=' flex items-center flex-col mb-[44px] md:mb-[48px] lg:mb-[52px]'>
          <GlowStar className='size-1.5 mb-4' />
          <h1 className='section-heading-3 text-center'>Register</h1>
          <p className='opacity-80 text-xs md:text-sm text-center'>Welcome to effekt client portal</p>
        </div>
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
            }
          )}
        >
          {formState.message}
        </div>
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
