'use client';

import { ArrowUpTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Button from '../ui/Button';
import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SelectUser } from '@/db/schema';
import { getClientAuthUser, getCurrentClientSession, updateUserProfilePicture } from '@/utils/actions/clientActions';
import { deleteAccountById, getSignedURL } from '@/utils/actions/serverActions';
import cn from '@/utils/general/cn';

const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const NavbarUserUI = ({ user }: { user: SelectUser }) => {
  const [dropDownActive, setDropDownActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    message: string | null;
  }>({ status: 'idle', message: '' });
  const router = useRouter();

  const supabase = createClient(); // Initialize the Supabase client

  const handleSignOut = async () => {
    console.log('Logging out');
    try {
      await supabase.auth.signOut();
      router.push('/auth');
      router.refresh();
    } catch (e) {
      console.log('error has occured during sign out:', e);
    }
  };

  const handleUploadProfilePicture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(file);
    setUploadStatus({ status: 'uploading', message: 'Uploading your Avatar' });

    if (!file) {
      setUploadStatus({ status: 'error', message: 'No file to upload' });
    }

    if (file) {
      console.log(file.type);
      //Generate Checksum to be used by AWS putObjectCommand
      //This ensures that the file uploaded is exactly what's recieved by AWS
      const checksum = await computeSHA256(file);

      try {
        const session = await getCurrentClientSession();
        //Generate signed URL from aws to then issue a POST req
        const signedURL = await getSignedURL('image', file.type, file.size, checksum, session);
        const fileUrl = signedURL.split('?')[0];

        //Start the upload process
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedURL, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log(`Upload Progress: ${percentComplete.toFixed(0)}%`);
            setUploadStatus({ status: 'uploading', message: `Uploading - ${percentComplete.toFixed(0)}%` });
          }
        };

        xhr.onload = async () => {
          console.log('Image URL:', fileUrl);
          setUploadStatus({ status: 'success', message: `Uploaded to AWS` });
          await updateUserProfilePicture(fileUrl, session?.user?.id);
          setFile(undefined);
          router.refresh();
        };

        xhr.onerror = () => {
          throw new Error('Upload failed');
        };

        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      } catch (error) {
        console.log(error);
        return;
      }
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
                  className='w-full h-full object-cover'
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
          <div className='flex flex-col gap-2'>
            <div className='w-full h-[1px] bg-transparent my-1'></div>
            {uploadStatus.status !== 'idle' && <div className='text-xs opacity-30'>{uploadStatus.message}</div>}
            <form
              onSubmit={handleUploadProfilePicture}
              className={cn(
                'group rounded-md cursor-pointer flex items-center justify-center gap-1 md:gap-2 select-none text-[13px] md:text-sm border-[1px] border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/15 opacity-80 hover:opacity-100',
                {
                  'bg-white/10 border-white/15 opacity-100': file,
                }
              )}
            >
              <label className='cursor-pointer w-full h-full'>
                <input
                  type='file'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])}
                  className='hidden'
                  accept='image/jpeg, image/png, image/webp'
                />
                <span className='w-full h-full flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 gap-3'>
                  {file ? (
                    <div className='w-full flex items-center justify-between'>
                      <span className='text-xs opacity-90'>{file.name}</span>
                      <button type='submit'>
                        <Button type='secondary' size='square' className='size-6'>
                          <ArrowUpTrayIcon className='w-3' />
                        </Button>
                      </button>
                    </div>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className='w-3' />
                      Change Avatar
                    </>
                  )}
                </span>
              </label>
            </form>

            <form className='w-full' onSubmit={handleSignOut}>
              <button type='submit' className='w-full'>
                <Button type='primary'>Logout</Button>
              </button>
            </form>
            <div className='w-full h-[1px] bg-grey10 my-4'></div>
            <div onClick={handleAccountDelete}>
              <Button type='destructive' className='opacity-40 hover:opacity-100'>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarUserUI;
