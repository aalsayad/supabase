import { createClient } from './client';
import { createClient as CreateServerClient } from './server';

const supabaseServer = CreateServerClient();
const supabaseClient = createClient();

export const getUserClient = async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data;
};

export const getUserServer = async () => {
  const { data, error } = await supabaseServer.auth.getUser();
  if (error) throw error;
  return data;
};
