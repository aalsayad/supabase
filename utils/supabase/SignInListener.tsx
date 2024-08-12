'use client';

import { createClient } from './client';
import { useRouter } from 'next/navigation';

const SignInListener = () => {
  const supabase = createClient();
  const router = useRouter();

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session);
    if (event === 'SIGNED_IN') {
      router.refresh();
    }
  });

  // call unsubscribe to remove the callback
  data.subscription.unsubscribe();

  return <></>; // This component doesn't need to render anything
};

export default SignInListener;
