import { createClient as CreateClientType } from '../../server';
import { Session, User, Provider } from '@supabase/supabase-js';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema';

type UserDbData = any;

export async function findUserInDb(
  supabase: ReturnType<typeof CreateClientType>,
  userId: string
): Promise<UserDbData | null> {
  console.log('findUserInDb...');
  const { data: userDbData, error } = await supabase.from('users').select('*').eq('authData->>id', userId).single();

  if (error) throw error;

  return userDbData;
}

export async function updateUserVerification(
  supabase: ReturnType<typeof CreateClientType>,
  userId: string,
  sessionUser: User
): Promise<void> {
  console.log('updateUserVerification...');
  const { error } = await supabase
    .from('users')
    .update({ verified: true, authData: sessionUser })
    .eq('authData->>id', userId);

  if (error) throw error;
}

export async function insertNewUserInDb(
  supabase: ReturnType<typeof CreateClientType>,
  sessionUser: User,
  verified: boolean
) {
  console.log('insertNewUserInDb...');
  const provider = sessionUser.app_metadata.provider;
  console.log(provider);
  const picture =
    provider === 'github'
      ? sessionUser?.user_metadata?.avatar_url
      : provider === 'google'
      ? sessionUser?.user_metadata?.picture
      : null;
  console.log(picture);
  const { error } = await supabase.from('users').insert([
    {
      authData: sessionUser,
      name: sessionUser?.user_metadata?.name || '',
      email: sessionUser.email,
      verified: verified,
      supaAdmin: false,
      picture,
      provider,
    },
  ]);

  if (error) throw error;
}

export async function signUpWithEmailAndPassword(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  password: string,
  userExtraMetaData?: any
): Promise<User | null> {
  console.log('signUpWithEmailAndPassword...');
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
      data: userExtraMetaData,
    },
  });

  if (error) throw error;

  return data.user;
}

export async function signInWithEmailAndPassword(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  password: string
): Promise<User | null> {
  console.log('signInWithEmailAndPassword...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) throw error;

  return data.user;
}

export async function signInWithOAuth(supabase: ReturnType<typeof CreateClientType>, provider: Provider) {
  console.log('signInWithOAuth...');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/confirm`,
    },
  });

  if (error) throw error;
}

export async function verifyAndLoginWithOtp(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  token: string
): Promise<User | null> {
  console.log('verifyAndLoginWithOtp...');
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

  if (error) throw error;

  return data.user;
}

export async function getAuthUser(supabase: ReturnType<typeof CreateClientType>): Promise<User | null> {
  console.log('getAuthUser...');
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

export async function getCurrentSession(supabase: ReturnType<typeof CreateClientType>): Promise<Session | null> {
  console.log('getCurrentSession...');
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  if (session) return session;
  else return null;
}

export async function resendConfirmationToEmail(supabase: ReturnType<typeof CreateClientType>, email: string) {
  console.log('resendConfirmationToEmail...');
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });

  if (error) throw error;
}
