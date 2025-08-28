// supabase/functions/update-mosque-profile/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, profileUpdates, mosqueUpdates } = await req.json()

    if (!userId || !profileUpdates || !mosqueUpdates) {
      throw new Error('User ID, profile, and mosque updates are required.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Update the user's personal details in the 'profiles' table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: profileUpdates.full_name,
        phone: profileUpdates.contact_number,
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Update the mosque's details in the 'mosques' table
    const { error: mosqueError } = await supabaseAdmin
      .from('mosques')
      .update({
        name: mosqueUpdates.name,
        address: mosqueUpdates.address,
        annual_amount: mosqueUpdates.annual_amount,
      })
      .eq('admin_id', userId);

    if (mosqueError) throw mosqueError;

    return new Response(JSON.stringify({ message: 'Profile updated successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
