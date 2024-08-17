'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Button from '../ui/Button';
import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SelectUser } from '@/db/schema';
import { getClientAuthUser } from '@/utils/actions/clientActions';
import { deleteAccountById } from '@/utils/actions/serverActions';

const NavbarUserUI = ({ user }: { user: SelectUser }) => {
  const [dropDownActive, setDropDownActive] = useState<boolean>(false);
  const router = useRouter();

  const supabase = createClient(); // Initialize the Supabase client

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
      router.refresh();
    } catch (e) {
      console.log('error has occured during sign out:', e);
    }
  };

  const handleAccountDelete = async () => {
    try {
      const user = await getClientAuthUser();
      if (!user) throw Error('Could not retreive user from current session');
      const id = user?.id;

      await deleteAccountById(id);
      console.log(`Account ${id} was deleted from Auth & DB`);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      onClick={() => {
        setDropDownActive((prev) => !prev);
      }}
      className='select-none text-xs md:text-sm  py-1.5 px-2 pr-3 bg-white/0 border-[1px] border-white/10 rounded-lg transition-300 cursor-pointer relative min-w-[240px]'
    >
      <div className='flex items-center justify-between gap-2 opacity-80 transition-300'>
        <div className='flex gap-2 items-center'>
          <div className='size-8 rounded-full overflow-hidden flex items-center justify-center bg-white/5 relative'>
            {user.picture ? (
              <div className='realtive w-full h-full bg-white/5 top-0 left-0'>
                <Image
                  src={user.picture}
                  alt='user picture'
                  width='300'
                  height='300'
                  className='w-full h-full object-fill'
                />
                <div className='w-full h-full bg-white/5 top-0 left-0 animate-pulse'></div>
              </div>
            ) : (
              <div className='absolute w-full h-full bg-slate-800 top-0 left-0 flex items-center justify-center font-semibold uppercase'>
                {user.email.charAt(0)}
              </div>
            )}
          </div>

          {user.name}
        </div>
        <ChevronDownIcon className={`w-3 transition-300 ${dropDownActive && 'rotate-180'}`} />
      </div>

      {dropDownActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          className='absolute left-0 top-[calc(100%+8px)] py-2 px-3 bg-dark w-full border-[1px] border-grey10 rounded-lg'
        >
          <p className='text-[10px] leading-[100%] opacity-30 font-light mb-3 relative text-nowrap overflow-hidden'>
            <span className='block relative'>
              User: #{user.id}
              <span className='w-1/4 bg-gradient-to-r from-dark/0 to-dark absolute block right-0 top-0 h-full'></span>
            </span>
            <span className='block relative'>
              Email: {user.email}
              <span className='w-1/4 bg-gradient-to-r from-dark/0 to-dark absolute block right-0 top-0 h-full'></span>
            </span>
            <span className='block relative'>
              Provider: {user.provider}
              <span className='w-1/4 bg-gradient-to-r from-dark/0 to-dark absolute block right-0 top-0 h-full'></span>
            </span>
          </p>
          <div onClick={handleSignOut} className='mb-1'>
            <Button type='primary'>Logout</Button>
          </div>
          <div onClick={handleAccountDelete}>
            <Button type='destructive'>Delete Account</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarUserUI;
