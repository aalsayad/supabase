'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import Button from '../ui/Button';
import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import { useRouter } from 'next/navigation';

const NavbarUserUI = ({ user }: { user: User }) => {
  const [dropDownActive, setDropDownActive] = useState<boolean>(false);
  const userData = user.user_metadata;
  const router = useRouter();

  const supabase = createClient(); // Initialize the Supabase client

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh(); // Refresh the page to re-trigger SSR and update the Navbar
    } catch (e) {
      console.log('error has occured during sign out:', e);
    }
  };
  return (
    <div
      onClick={() => {
        setDropDownActive((prev) => !prev);
      }}
      className='select-none text-xs md:text-sm  py-2 px-3 bg-white/0 border-[1px] border-white/10 rounded-lg transition-300 cursor-pointer relative'
    >
      <div className='flex items-center gap-2 opacity-80 transition-300'>
        {userData.email}
        <ChevronDownIcon className={`w-3 transition-300 ${dropDownActive && 'rotate-180'}`} />
      </div>

      {dropDownActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          className='absolute left-0 top-[calc(100%+8px)] py-2 px-3 bg-dark w-full border-[1px] border-grey10 rounded-lg'
        >
          <p className='text-[10px] leading-[100%] opacity-30 font-light mb-3 relative text-nowrap overflow-hidden'>
            User: {userData.sub}
            <span className='w-1/4 bg-gradient-to-r from-dark/0 to-dark absolute block right-0 top-0 h-full'></span>
          </p>
          <div onClick={handleSignOut}>
            <Button type='primary'>Logout</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarUserUI;
