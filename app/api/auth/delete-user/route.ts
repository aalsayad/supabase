import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';

export async function POST(req: Request) {
  const { userId, email } = await req.json();
  console.log(email);

  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing user ID or email' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    // Delete the user from the auth system
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 500 });
    }

    // Delete the user from the 'users' table
    const { error: deleteDbError } = await supabase.from('users').delete().eq('email', email);
    if (deleteDbError) {
      return NextResponse.json({ error: deleteDbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'An error occurred while deleting the user' }, { status: 500 });
  }
}
