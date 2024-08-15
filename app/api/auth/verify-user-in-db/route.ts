import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';

export async function POST(req: Request) {
  const { authData, email } = await req.json();

  console.log('🔹 api/auth/verify-user-in-db');

  if (!authData) {
    return NextResponse.json({ error: 'Missing authData 🔸 api/auth/verify-user-in-db' }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: 'Missing email 🔸 api/auth/verify-user-in-db' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const { error: dbUpdateError } = await supabase
      .from('users')
      .update({ verified: true, authData: authData })
      .eq('authData->>id', authData.id);

    if (dbUpdateError)
      return NextResponse.json(
        {
          error: `User verification failed to updated in users db 🔸 api/auth/verify-user-in-db - Code:${dbUpdateError.code} - Message:${dbUpdateError.message}`,
        },
        { status: 400 }
      );

    return NextResponse.json(
      { message: 'User verification column succesfully updated in users db 🟢 api/auth/verify-user-in-db' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return NextResponse.json({ error: 'Unexpected error occurred 🔸 verify-user-in-db' }, { status: 500 });
  }
}
