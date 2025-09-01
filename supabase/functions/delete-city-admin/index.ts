import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdminClient } from '../../_shared/supabase-admin.ts';

serve(async (req) => {
  // 1. Check for proper authorization (ensure only a super_admin can call this)
  const supabaseAdmin = createSupabaseAdminClient(req);
  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user || user.app_metadata?.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  // 2. Get the userId from the request body
  const { userId } = await req.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // 3. Delete the user from auth.users.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ message: 'City admin deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});


