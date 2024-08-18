'use server';

import { InsertUser, SelectUser } from '@/db/schema';
import { Session, User, Provider } from '@supabase/supabase-js';
import { createServiceRoleClient } from '../supabase/server-service-role';

const supabase = createServiceRoleClient(); //*Imported from /supabase/server-service-role

const redirectURL =
  process.env.NEXT_PUBLIC_CURRENT_ENVIROMENT === 'dev'
    ? 'http://localhost:3000/verify'
    : 'https://supabase-ebon.vercel.app/verify';

//@--Returns a userfrom users Table by ID
export async function findUserInDbById(userId: string): Promise<SelectUser | null> {
  console.log('findUserInDb⚡');
  const { data: userDbData, error } = await supabase.from('users').select('*').eq('authData->>id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.error('PGRST116 - 0 Rows - Returning user as null');
      return null;
    }
    throw error;
  }

  return userDbData;
}

//@--Returns a userfrom users Table by email
export async function findUserInDbByEmail(email: string): Promise<SelectUser | null> {
  console.log('findUserInDb⚡');
  const { data: userDbData, error } = await supabase.from('users').select('*').eq('authData->>email', email).single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.error('PGRST116 - 0 Rows - Returning user as null');
      return null;
    }
    throw error;
  }

  return userDbData;
}

//@--Updates the verified column in users Table by userID
export async function updateUserDbVerification(userId: string, sessionUser: User): Promise<void> {
  console.log('updateUserVerification⚡');
  const { error } = await supabase
    .from('users')
    .update({ verified: true, authData: sessionUser })
    .eq('authData->>id', userId);

  if (error) throw error;
}

//@--Inserts a new user to users Table with an option to insert the user as verified or unverified
export async function insertNewUserInDb(sessionUser: User, verified: boolean) {
  console.log('insertNewUserInDb⚡');
  const provider = sessionUser.app_metadata.provider;
  console.log(provider);
  const picture =
    provider === 'github'
      ? sessionUser?.user_metadata?.avatar_url
      : provider === 'google'
      ? sessionUser?.user_metadata?.picture
      : null;
  console.log(picture);

  const newUser: InsertUser = {
    authData: sessionUser, // Ensure this matches your schema's JSONB type
    name: sessionUser?.user_metadata?.name || 'no_name',
    email: sessionUser.email!,
    verified: verified,
    supaAdmin: false, // Default value
    picture,
    provider: provider || 'no_provider',
  };

  const { error } = await supabase.from('users').insert([newUser]);

  if (error) throw error;
}

//@--Retreives Auth User from the server
export async function getServerAuthUser(): Promise<User | null> {
  console.log('getAuthUser⚡');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (error) console.error(error);
    return null;
  }
  return user;
}

//@--Retreives Auth session from the server
export async function getCurrentServerSession(): Promise<Session | null> {
  console.log('getCurrentSession⚡');
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  if (session) return session;
  else return null;
}

//@--Allow a User to delete their account
export async function deleteAccountById(userId: string) {
  console.log('deleteAccountById⚡');
  const { error: deleteDbError } = await supabase.from('users').delete().eq('authData->>id', userId);
  if (deleteDbError) throw deleteDbError;

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteAuthError) throw deleteAuthError;
}

//@Signs in a user using OAuth - Opens Window
export async function signInWithOAuth(provider: Provider) {
  console.log('signInWithOAuth⚡');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: redirectURL,
    },
  });

  if (error) throw error;
}

//!Amazon S3
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { putObjectCommand, s3 } from '../aws/s3/client';

//@Returns a signed URL to allow user to upload a file to s3, we will use this link to send a PUT request and upload file to S3
export async function getSignedURL(
  family: 'image' | 'video' | 'document' | 'zip',
  type: string,
  size: number,
  checksum: string,
  session: Session | null
) {
  const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const acceptedVideoTypes = ['video/mp4', 'video/webm'];
  const acceptedDocumentTypes = [
    'application/pdf', // PDF
    'application/msword', // Word (.doc)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
    'application/vnd.ms-excel', // Excel (.xls)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
    'application/vnd.ms-powerpoint', // PowerPoint (.ppt)
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint (.pptx)
  ];
  const acceptedZipTypes = [
    'application/zip', // ZIP files
    'application/x-zip-compressed', // ZIP files (alternative MIME type)
  ];

  let maxFileSize: number;

  //File type checks
  if (family === 'image') {
    if (!acceptedImageTypes.includes(type)) throw Error('Invalid File Type for family: Image');
    maxFileSize = 1024 * 1024 * 3; // 3 MB
  } else if (family === 'video') {
    if (!acceptedVideoTypes.includes(type)) throw Error('Invalid File Type for family: Video');
    maxFileSize = 1024 * 1024 * 100; // 30 MB
  } else if (family === 'document') {
    if (!acceptedDocumentTypes.includes(type)) throw Error('Invalid File Type for family: Document');
    maxFileSize = 1024 * 1024 * 100; // 30 MB
  } else if (family === 'zip') {
    if (!acceptedZipTypes.includes(type)) throw Error('Invalid File Type for family: Zip');
    maxFileSize = 1024 * 1024 * 300; // 300 MB
  } else {
    throw Error('Invalid Family Type');
  }

  //File Size checks
  if (size > maxFileSize) throw Error(`File too large. Max Size: ${maxFileSize}MB`);

  if (!session) throw Error(`Not Authenticated`);

  const signedURL = await getSignedUrl(s3, putObjectCommand(type, size, checksum, session.user.id), {
    expiresIn: 60,
  });

  return signedURL;
}
