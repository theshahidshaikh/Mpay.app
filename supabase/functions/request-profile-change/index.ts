// supabase/functions/request-profile-change/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, newCity, newState } = await req.json()

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check for an existing pending request for this user
    const { data: existingRequest, error: existingError } = await supabaseAdmin
      .from('profile_change_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle()
    
    if (existingError) throw existingError

    if (existingRequest) {
      throw new Error('You already have a pending location change request.');
    }

    // 2. Insert the new request
    const { error: insertError } = await supabaseAdmin
      .from('profile_change_requests')
      .insert({
        user_id: userId,
        new_city: newCity,
        new_state: newState,
        status: 'pending',
      })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ message: 'Change request submitted successfully.' }), {
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
