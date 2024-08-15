import { createClient as CreateClientType } from '../../server';
import { User } from '@supabase/supabase-js';

type UserDbData = any;

export async function findUserInDb(
  supabase: ReturnType<typeof CreateClientType>,
  userId: string
): Promise<UserDbData | null> {
  const { data: userDbData, error } = await supabase.from('users').select('*').eq('authData->>id', userId).single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error checking existing user by authData ID - Code:${error.code} - Message:${error.message}`);
  }

  return userDbData;
}

export async function updateUserVerification(
  supabase: ReturnType<typeof CreateClientType>,
  userId: string,
  sessionUser: User
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ verified: true, authData: sessionUser })
    .eq('authData->>id', userId);

  if (error) {
    throw new Error(`User verification failed to update in users db - Code:${error.code} - Message:${error.message}`);
  }
}

export async function insertNewUser(supabase: ReturnType<typeof CreateClientType>, sessionUser: User) {
  const { error } = await supabase.from('users').insert([
    {
      authData: sessionUser,
      name: sessionUser?.user_metadata?.name || '',
      picture: sessionUser?.user_metadata?.avatar_url,
      email: sessionUser.email,
      supaAdmin: false,
      verified: true,
    },
  ]);

  if (error) {
    throw new Error(`An error has occurred during inserting user to DB: ${error.message}`);
  }
}

export async function signUpWithEmailAndPassword(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    throw new Error(`User SignUp with Email failed - code:${error.code} - Message:${error.message}`);
  }

  return data.user;
}

export async function signInWithEmailAndPassword(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    throw new Error(`User sign in with Email & Password failed - code:${error.code} - Message:${error.message}`);
  }

  return data.user;
}
