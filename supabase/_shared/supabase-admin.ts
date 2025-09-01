import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

/**
 * Creates a Supabase client with admin privileges.
 * This is necessary for performing actions that bypass Row Level Security (RLS),
 * such as deleting users from the auth schema.
 *
 * @param req The incoming request object, used to extract the Authorization header.
 * @returns A Supabase client instance with the service_role key.
 */
export function createSupabaseAdminClient(req: Request) {
  // Create a Supabase client with the service_role key
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Additionally, you can set the Authorization header from the incoming request
  // to perform actions on behalf of the authenticated user.
  supabaseAdmin.auth.setAuth(req.headers.get('Authorization')!);

  return supabaseAdmin;
}