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
        <div className='h-fit flex flex-col items-center p-2 md:p-4 lg:p-6 py-8 md:py-10 lg:py-12 rounded-lg md:rounded-xl lg:rounded-2xl border-[1px] border-grey10 w-full max-w-[450px]'>
          {formComponent === 'login' && (
            <>
              <LoginForm />
              <div onClick={() => setFormComponent('register')} className='w-full'>
                <Button type='ghost' arrow>
                  Register
                </Button>
              </div>
            </>
          )}
          {formComponent === 'register' && (
            <>
              <RegisterForm />
              <div onClick={() => setFormComponent('login')} className='w-full'>
                <Button type='ghost' arrow>
                  Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
