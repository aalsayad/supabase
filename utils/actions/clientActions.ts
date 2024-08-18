import { Provider, Session, User } from '@supabase/supabase-js';
import { createClient } from '../supabase/client';

const supabase = createClient(); //*Imported from /supabase/client
//!   Important Notice:
//!   -----------------
//!   These actions should not require supabase Service Role Client
//!   or there is a risk of exposing the SERVICE_ROLE_KEY to the client

//@Signs in a user using OAuth - Opens Window
export async function signInWithOAuth(provider: Provider) {
  console.log('signInWithOAuth⚡');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
    },
  });

  if (error) throw error;
}

//@Retreives Auth User from the client
export async function getClientAuthUser(): Promise<User | null> {
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

//@Retreives Auth session from the server
export async function getCurrentClientSession(): Promise<Session | null> {
  console.log('getCurrentSession⚡');
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  if (session) return session;
  else return null;
}

//@--Sign In with email & password and checks provider to throw error if email used with provider other than email
export async function signInWithEmailAndPassword(email: string, password: string): Promise<User | null> {
  console.log('signInWithEmailAndPassword⚡');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) throw error;

  return data.user;
}

//@--Signs up a user with an Email & Password and sends out an email to confirm page
export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  userExtraMetaData?: any
): Promise<User | null> {
  console.log('signUpWithEmailAndPassword⚡');
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
      data: userExtraMetaData,
    },
  });

  if (error) throw error;

  return data.user;
}

//@Resends a confirmation email to user
export async function resendConfirmationToEmail(email: string) {
  console.log('resendConfirmationToEmail⚡');
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/verify`,
    },
  });

  if (error) throw error;
}

//@--Verifies a user from token & email
export async function verifyAndLoginWithOtp(email: string, token: string): Promise<User | null> {
  console.log('verifyAndLoginWithOtp⚡');
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

  if (error) throw error;

  return data.user;
}

//@--Resends confirmation email to reset password
export async function resetPassword(email: string, redirectURL: string) {
  console.log('resetPassword⚡');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectURL,
  });

  if (error) throw error;
}

//@--Reset user's password
export async function resetAccountPassword(password: string) {
  console.log('resetAccountPassword⚡');

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) throw error;
}

//@-- Allow user to update his record with new profile picture
export async function updateUserProfilePicture(url: string, userId: string | undefined) {
  const currentUser = await getClientAuthUser();
  if (!currentUser) throw Error('No user currently logged in');

  if (userId !== currentUser.id) throw Error('User Id mismatch');

  const { error } = await supabase.from('users').update({ picture: url }).eq('authData->>id', userId);

  if (error) throw Error('User Id mismatch');
}
