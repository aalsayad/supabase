'use client';

import { useRouter } from 'next/navigation';
import cn from '@/utils/general/cn';
import { useState } from 'react';
import * as z from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/utils/zod/schemas';

import Button from '@/components/ui/Button';
import { GlowStar } from '@/components/ui/Glowstar';
import { resetPassword } from '@/utils/actions/clientActions';
import { findUserInDbByEmail } from '@/utils/actions/serverActions';

interface FormState {
  status: 'idle' | 'submitting' | 'pending' | 'success' | 'error';
  message: string | null;
}

const ForgotPasswordForm = () => {
  //Keep track of form state
  const [formState, setFormState] = useState<FormState>({ status: 'idle', message: null });

  //Init useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const login: SubmitHandler<z.infer<typeof forgotPasswordSchema>> = async (formData) => {
    setFormState({ status: 'submitting', message: 'Sending confirmation link' });
    try {
      const userDbData = await findUserInDbByEmail(formData.email);
      if (!userDbData) throw Error('No user assosiated with this email address');

      const userProvider = userDbData.provider;
      if (userProvider !== 'email')
        throw Error(`No password associated with this email. Please use ${userProvider} to sign in`);

      await resetPassword(formData.email, window.location.origin);
      setFormState({ status: 'pending', message: 'Please check your inbox' });
    } catch (error: any) {
      setFormState({ status: 'error', message: error.message || 'Unknown error encountered' });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(login)} className='w-full'>
        {/* ------------------Form Header------------------ */}
        <div className=' flex items-center flex-col mb-[44px] md:mb-[48px] lg:mb-[52px]'>
          <GlowStar className='size-1.5 mb-4' />
          <h1 className='section-heading-3 text-center'>Forgot Password</h1>
          <p className='opacity-80 text-xs md:text-sm text-center'>Please enter your email to continue</p>
        </div>
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
        </div>
        {/* login Form Button */}
        <div className='w-full mt-6'>
          <button
            type='submit'
            className={cn('w-full', {
              'opacity-30 pointer-events-none': formState.status === 'submitting',
            })}
          >
            <Button type='primary' arrow>
              Continue
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

export default ForgotPasswordForm;
