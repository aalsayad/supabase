import React, { use } from 'react';
import Container from '../ui/Container';
import Image from 'next/image';
import effektLogo from '@/public/images/effektlogo.svg';
import { createClient } from '@/utils/supabase/server';
import NavbarUserUI from './NavbarUserUI';
import Link from 'next/link';
import { findUserInDbById } from '@/utils/actions/serverActions';

const getUserData = async () => {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const userTableData = await findUserInDbById(user.id);
    return userTableData;
  } catch (e) {
    console.log(e);
    return;
  }
};

export default async function Navbar() {
  const user = await getUserData();
  return (
    <nav className='fixed top-0 left-0 w-full  bg-dark border-b-[1px] border-b-grey10'>
      <Container bordered={false} removeInnerPadding className='h-16 md:h-18 lg:h-20'>
        <div className='w-full h-full flex items-center justify-between'>
          <Link href='/'>
            <Image src={effektLogo} className='w-[70px] md:w-[80px] lg:w-[85px]' alt='effekt.design Logo' />
          </Link>
          {user && (
            <>
              <NavbarUserUI user={user} />
            </>
          )}
        </div>
      </Container>
    </nav>
  );
}
