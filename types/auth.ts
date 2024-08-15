import { User } from '@supabase/supabase-js';

export interface RegisterUserRequest {
  authData: User;
  name: string;
  email: string;
  picture?: string | null;
  verified: boolean;
}
