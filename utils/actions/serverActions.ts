'use server';

import { InsertUser, SelectUser } from '@/db/schema';
import { Session, User, Provider } from '@supabase/supabase-js';
import { createServiceRoleClient } from '../supabase/server-service-role';

const supabase = createServiceRoleClient(); //*Imported from /supabase/server-service-role

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
