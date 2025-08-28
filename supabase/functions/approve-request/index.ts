// supabase/functions/approve-request/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requestId, requestType, action } = await req.json() || {}

    if (!requestId || !requestType) {
      throw new Error('Missing required fields: requestId and requestType are required.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (requestType) {
      case 'user': {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', requestId);
        if (profileError) throw profileError;

        const { error: adminProfileError } = await supabaseAdmin
          .from('admin_profiles')
          .update({ status: 'active' })
          .eq('id', requestId);
        if (adminProfileError) console.warn(adminProfileError.message);
        
        break;
      }
      case 'mosque': {
        const { error } = await supabaseAdmin
          .from('mosques')
          .update({ status: 'active' })
          .eq('id', requestId);
        if (error) throw error;
        break;
      }
      case 'profile_change': {
        const status = action === 'approve' ? 'approved' : 'rejected';

        if (status === 'approved') {
          // 1. Get the user_id and new location from the request
          const { data: requestData, error: requestError } = await supabaseAdmin
            .from('profile_change_requests')
            .select('user_id, new_city, new_state')
            .eq('id', requestId)
            .single();
          
          if (requestError || !requestData) throw new Error('Request not found.');

          // 2. Update the admin_profiles table
          const { error: updateAdminError } = await supabaseAdmin
            .from('admin_profiles')
            .update({ city: requestData.new_city, state: requestData.new_state })
            .eq('id', requestData.user_id);

          if (updateAdminError) throw updateAdminError;

          // --- NEW LOGIC: Update all associated mosques ---
          const { error: updateMosquesError } = await supabaseAdmin
            .from('mosques')
            .update({ city: requestData.new_city, state: requestData.new_state })
            .eq('admin_id', requestData.user_id);

          if (updateMosquesError) throw updateMosquesError;
          // --- END NEW LOGIC ---
        }

        // 3. Update the status of the request itself
        const { error: statusError } = await supabaseAdmin
          .from('profile_change_requests')
          .update({ status: status })
          .eq('id', requestId);
        
        if (statusError) throw statusError;
        
        break;
      }
      case 'household': {
        const { error } = await supabaseAdmin
          .from('households')
          .update({ status: 'active' })
          .eq('id', requestId);
        if (error) throw error;
        break;
      }
      default:
        throw new Error(`Invalid request type provided: ${requestType}`);
    }

    return new Response(JSON.stringify({ message: 'Request processed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
