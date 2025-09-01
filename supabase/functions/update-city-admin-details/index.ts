import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseAdminClient } from '../../_shared/supabase-admin.ts';

serve(async (req) => {
  const supabaseAdmin = createSupabaseAdminClient(req);
  const { data: { user } } = await supabaseAdmin.auth.getUser();

  if (!user || user.app_metadata?.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  const { userId, updates } = await req.json();
  if (!userId || !updates) {
    return new Response(JSON.stringify({ error: 'userId and updates are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Update the user's profile in the 'admin_profiles' table
    const { error } = await supabaseAdmin
      .from('admin_profiles')
      .update({
        full_name: updates.fullName,
        contact_number: updates.contactNumber,
      })
      .eq('id', userId);

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'City admin updated successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});