import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';

export async function POST(req: Request): Promise<NextResponse> {
  const { authData, name, email, picture, verified } = await req.json();
  const supabase = createServiceRoleClient();

  // Logging API action
  console.log('🔹 api/auth/register-user-to-db');

  if (!authData || !email || !name) {
    return NextResponse.json({ error: 'Missing required fields 🔸 api/auth/register-user-to-db' }, { status: 400 });
  }

  try {
    // Additionally, check if the user already exists by authData ID
    const { data: existingUserById, error: userFetchErrorById } = await supabase
      .from('users')
      .select('id')
      .eq('authData->>id', authData.id)
      .single();

    if (userFetchErrorById && userFetchErrorById.code !== 'PGRST116') {
      //PGRST116 is an error during fetching user by id, this condition checks if there is any error other than user not found like server errors
      return NextResponse.json(
        {
          error: `Error checking existing user by authData ID in users db 🔸 api/auth/register-user-to-db - Code:${userFetchErrorById.code} - Message:${userFetchErrorById.message}`,
        },
        { status: 500 }
      );
    }

    if (existingUserById) {
      // User already registered by authData ID
      return NextResponse.json(
        { message: 'User already registered - checked by authData ID 🔵 api/auth/register-user-to-db' },
        { status: 200 }
      );
    }

    // Register the user if they don't exist by either email or authData ID
    const { error: dbInsertError } = await supabase.from('users').insert({
      name,
      email,
      authData,
      picture: picture ? picture : null,
      verified: verified ? true : false,
    });

    if (dbInsertError) {
      return NextResponse.json(
        {
          error: `Error during record insertion in users db 🔸 api/auth/register-user-to-db - Code:${dbInsertError.code} - Message:${dbInsertError.message}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'User added successfully to users db 🟢 api/auth/register-user-to-db' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return NextResponse.json({ error: 'Unexpected error occurred 🔸 api/auth/register-user-to-db' }, { status: 500 });
  }
}
