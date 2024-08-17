'use client';

import cn from '@/utils/general/cn';
import { useState } from 'react';
import * as z from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetSchema } from '@/utils/zod/schemas';
import Button from '@/components/ui/Button';
import { resetAccountPassword } from '@/utils/actions/clientActions';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
}

const PasswordResetForm = () => {
  //Keep track of form state
  const [formState, setFormState] = useState<FormState>({ status: 'idle', message: null });

  const router = useRouter();

  //Init useForm
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
  });

  const resetPassword: SubmitHandler<z.infer<typeof passwordResetSchema>> = async (formData) => {
    setFormState({ status: 'submitting', message: 'Sending confirmation link' });
    try {
      await resetAccountPassword(formData.password);
      setFormState({ status: 'success', message: 'Password changed' });
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setFormState({ status: 'error', message: error.message || 'Unknown error encountered' });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(resetPassword)} className='w-full'>
        {/* Form State */}
        <div className='h-20 flex items-center justify-center'>
          <div
            className={cn(
              'py-3 w-full flex items-center justify-center text-xs md:text-xs opacity-80 border-[1px] rounded-[4px] my-1 md:my-2 lg:my-3',
              {
                'opacity-0': formState.status === 'idle' || formState.status === 'submitting',
                'opacity-100 bg-green-500/10 border-green-300/15 text-green-200': formState.status === 'success',
                'opacity-100 bg-red-500/10 border-red-300/15 text-red-200': formState.status === 'error',
              }
            )}
          >
            {formState.message}
          </div>
        </div>
        {/* ------------------Form Fields------------------ */}
        <div className='space-y-2 w-full'>
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
        {/* Form Button */}
        <div className='w-full mt-6'>
          <button
            type='submit'
            className={cn('w-full', {
              'opacity-30 pointer-events-none': formState.status === 'submitting',
            })}
          >
            <Button type='primary'>
              <LockClosedIcon className='w-3' />
              Reset Password
            </Button>
          </button>
        </div>
      </form>
    </>
  );
};

export default PasswordResetForm;
