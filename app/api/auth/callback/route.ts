import { NextResponse, NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server-service-role';
import {
  findUserInDb,
  insertNewUserInDb,
  updateUserVerification,
  verifyAndLoginWithOtp,
  getCurrentSession,
} from '@/utils/supabase/actions/auth/actions';

type JsonResponse = {
  message?: string;
  error?: string;
  session?: any;
};
function jsonResponse(message: JsonResponse, status: number) {
  return NextResponse.json(message, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { token, email, code, sessionUser } = await req.json();

  const supabase = createServiceRoleClient();

  try {
    if (code) {
      if (!sessionUser) return jsonResponse({ error: `No Active user found 🔸` }, 500);
      const userDbData = await findUserInDb(supabase, sessionUser.id);

      if (userDbData) {
        if (userDbData.verified) {
          return jsonResponse({ message: 'User Already verified and registered on users db 🟢' }, 200);
        } else {
          await updateUserVerification(supabase, sessionUser.id, sessionUser);
          return jsonResponse({ message: 'User Just verified in users db 🟢' }, 200);
        }
      }

      await insertNewUserInDb(supabase, sessionUser, true);
      return jsonResponse({ message: 'User Added & verified in users db 🟢' }, 200);
    }

    if (token && email) {
      const user = await verifyAndLoginWithOtp(supabase, email, token);
      if (!user) return jsonResponse({ message: 'User Verified but no user data could be retreived 🔸' }, 404);
      await updateUserVerification(supabase, user.id, user);

      const session = await getCurrentSession(supabase);
      return jsonResponse({ message: 'User Added & verified in users db 🟢', session }, 200);
    }

    return jsonResponse({ message: 'No Authentication Data was received 🔸' }, 404);
  } catch (error: any) {
    console.error('Unexpected error in POST handler:', error);
    return jsonResponse({ error: `Unexpected error occurred 🔸 ${error.message}` }, 500);
  }
}
