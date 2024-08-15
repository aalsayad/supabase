'use client';

import LoginForm from '@/components/forms/LoginForm';
import RegisterForm from '@/components/forms/RegisterForm';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useState } from 'react';

export default function LoginPage() {
  const [formComponent, setFormComponent] = useState<'login' | 'register' | 'forgotPassword'>('login');

  return (
    <Container first fullscreen bordered={false}>
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <div className='h-fit flex flex-col items-center p-2 md:p-4 lg:p-6 py-8 md:py-10 lg:py-12 rounded-lg md:rounded-xl lg:rounded-2xl border-[1px] border-grey10 w-full max-w-[480px]'>
          {formComponent === 'login' && (
            <>
              <LoginForm />
              <div onClick={() => setFormComponent('register')} className='w-full mt-8'>
                <Button type='ghost' arrow>
                  <span className='opacity-50 mr-1'>Don't have an account</span> Register
                </Button>
              </div>
            </>
          )}
          {formComponent === 'register' && (
            <>
              <RegisterForm />
              <div onClick={() => setFormComponent('login')} className='w-full mt-8'>
                <Button type='ghost' arrow>
                  <span className='opacity-50 mr-1'>Already have an account?</span> Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
