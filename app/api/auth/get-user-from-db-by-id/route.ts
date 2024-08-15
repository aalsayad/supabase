import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';

export async function POST(req: Request) {
  const { id } = await req.json();

  console.log('🔹 get-user-from-db-by-id');

  if (!id) {
    return NextResponse.json({ error: 'Missing user id 🔸 get-user-from-db-by-id' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    // Fetch user data from the database
    const { data: userDbData, error: userDbFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('authData->>id', id)
      .single();

    if (userDbFetchError) {
      return NextResponse.json(
        {
          error: `Encountered error while fetching user 🔸 get-user-from-db-by-id - Code:${userDbFetchError.code} - Message:${userDbFetchError.message}`,
        },
        { status: 500 }
      );
    }

    if (!userDbData) {
      return NextResponse.json({ error: 'User not found 🔸 get-user-from-db-by-id' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User Found 🟢 get-user-from-db-by-id', data: userDbData }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return NextResponse.json({ error: 'Unexpected error occurred 🔸 get-user-from-db-by-id' }, { status: 500 });
  }
}
