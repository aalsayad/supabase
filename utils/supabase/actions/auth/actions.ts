import { createClient as CreateClientType } from '../../server';
import { Session, User, Provider } from '@supabase/supabase-js';

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

export async function insertNewUserInDb(
  supabase: ReturnType<typeof CreateClientType>,
  sessionUser: User,
  verified: boolean
) {
  const provider = sessionUser.app_metadata.provider;
  const picture =
    provider === 'github'
      ? sessionUser?.user_metadata?.avatar_url
      : provider === 'google'
      ? sessionUser?.user_metadata?.picture
      : null;
  const { error } = await supabase.from('users').insert([
    {
      authData: sessionUser,
      name: sessionUser?.user_metadata?.name || '',
      email: sessionUser.email,
      verified: verified,
      picture,
      provider,
      supaAdmin: false,
    },
  ]);

  if (error) {
    throw new Error(
      `An error has occurred during inserting user to DB: - code:${error.code} - Message:${error.message}`
    );
  }
}

export async function signUpWithEmailAndPassword(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  password: string,
  userExtraMetaData?: any
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
      data: userExtraMetaData,
    },
  });

  if (error) {
    throw new Error(`User signUp with email & password failed - code:${error.code} - Message:${error.message}`);
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

export async function signInWithOAuth(supabase: ReturnType<typeof CreateClientType>, provider: Provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/confirm`,
    },
  });

  if (error) {
    throw new Error(`Signing in with providor has failed - code:${error.code} - Message:${error.message}`);
  }
}

export async function verifyAndLoginWithOtp(
  supabase: ReturnType<typeof CreateClientType>,
  email: string,
  token: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

  if (error) {
    throw new Error(`Verifying and logging user with OTP has failed - code:${error.code} - Message:${error.message}`);
  }

  return data.user;
}

export async function getAuthUser(supabase: ReturnType<typeof CreateClientType>): Promise<User | null> {
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
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Error in getting current session - code:${error.code} - Message:${error.message}`);
  }
  if (session) return session;
  else return null;
}
