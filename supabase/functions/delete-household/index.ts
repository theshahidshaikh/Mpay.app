// supabase/functions/delete-household/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { householdId } = await req.json();

    if (!householdId) {
      throw new Error('Household ID is required.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Get the user_id associated with the household
    const { data, error: fetchError } = await supabaseAdmin
      .from('households')
      .select('user_id')
      .eq('id', householdId)
      .single();

    if (fetchError || !data) throw new Error('Household not found.');

    // 2. Delete the user from auth.users. RLS and cascades will handle the rest.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ message: 'Household deleted successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
