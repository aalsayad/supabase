import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';

export async function POST(req: Request) {
  const { userId, email } = await req.json();

  console.log('🔹 api/auth/delete-user');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId 🔸 api/auth/delete-user' }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: 'Missing email 🔸 api/auth/delete-user' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    // Delete the user from the auth system
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('Error deleting user from auth system:', deleteAuthError);
      return NextResponse.json(
        {
          error: `Error during user deletion from auth system 🔸 api/auth/delete-user - Message: ${deleteAuthError.message}`,
        },
        { status: 500 }
      );
    }

    // Delete the user from the 'users' table
    const { error: deleteDbError } = await supabase.from('users').delete().eq('email', email);
    if (deleteDbError) {
      console.error('Error deleting user from database:', deleteDbError);
      return NextResponse.json(
        {
          error: `Error during user deletion from database 🔸 api/auth/delete-user - Message: ${deleteDbError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully 🟢 api/auth/delete-user' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return NextResponse.json({ error: 'Unexpected error occurred 🔸 api/auth/delete-user' }, { status: 500 });
  }
}
