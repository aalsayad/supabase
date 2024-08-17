'use client';

import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import LoginForm from '@/components/forms/LoginForm';
import RegisterForm from '@/components/forms/RegisterForm';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LoginPage() {
  const [formComponent, setFormComponent] = useState<'login' | 'register' | 'forgotPassword'>('login');

  return (
    <Container first fullscreen bordered={false}>
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <div className='h-fit flex flex-col items-center p-2 md:p-4 lg:p-6 py-8 md:py-10 lg:py-12 rounded-lg md:rounded-xl lg:rounded-2xl border-[1px] border-grey10 w-full max-w-[480px] bg-[rgb(255,255,255,0.01)]'>
          {formComponent === 'login' && (
            <>
              <LoginForm setFormComponent={setFormComponent} />
              <div onClick={() => setFormComponent('register')} className='w-full'>
                <Button type='ghost' arrow>
                  <span className='opacity-50 mr-1'>Don't have an account</span> Register
                </Button>
              </div>
            </>
          )}
          {formComponent === 'register' && (
            <>
              <RegisterForm />
              <div onClick={() => setFormComponent('login')} className='w-full'>
                <Button type='ghost' arrow>
                  <span className='opacity-50 mr-1'>Already have an account?</span> Login
                </Button>
              </div>
            </>
          )}
          {formComponent === 'forgotPassword' && (
            <>
              <ForgotPasswordForm />
              <div onClick={() => setFormComponent('login')} className='w-full'>
                <Button type='ghost'>
                  <ArrowLeftIcon className='w-3' />
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
