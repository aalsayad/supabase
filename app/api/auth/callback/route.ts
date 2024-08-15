import { NextResponse, NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';
import { findUserInDb, insertNewUser, updateUserVerification } from '@/utils/supabase/actions/auth/actions';

type JsonResponse = {
  message?: string;
  error?: string;
};
function jsonResponse(message: JsonResponse, status: number) {
  return NextResponse.json(message, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { token, email, code, sessionUser } = await req.json(); // Extract data from the request body
  console.log(token, email, code, sessionUser);

  const supabase = createServiceRoleClient();
  if (!sessionUser) return jsonResponse({ error: `No Active user found 🔸` }, 500);

  try {
    if (code) {
      const userDbData = await findUserInDb(supabase, sessionUser.id);

      if (userDbData) {
        if (userDbData.verified) {
          return jsonResponse({ message: 'User Already verified and registered on users db 🟢' }, 200);
        } else {
          await updateUserVerification(supabase, sessionUser.id, sessionUser);
          return jsonResponse({ message: 'User Just verified in users db 🟢' }, 200);
        }
      }

      await insertNewUser(supabase, sessionUser);
      return jsonResponse({ message: 'User Added & verified in users db 🟢' }, 200);
    }

    if (token && email) {
      console.log(`Token - ${token} & Email - ${email} received from search params - attempting to verify and sign in`);
      // Additional logic for handling token and email should be added here
    }

    return jsonResponse({ message: 'No Authentication Data was received' }, 404);
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return jsonResponse({ error: `Unexpected error occurred 🔸 ${error}` }, 500);
  }
}
