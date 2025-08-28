// supabase/functions/update-mosque/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    // THIS IS THE FIX: We now check the 'admin_profiles' table for the user's role.
    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('role, city')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Forbidden: You do not have permission to update mosques.')
    }
    
    // Both super_admin and city_admin can update mosques.
    if (profile.role !== 'super_admin' && profile.role !== 'city_admin') {
      throw new Error('Forbidden: Your role does not permit this action.')
    }

    const { mosqueId, updates } = await req.json()
    if (!mosqueId || !updates) {
      throw new Error('Mosque ID and updates object are required.')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Security check for city-scoped admins
    if (profile.role === 'city_admin') {
      const { data: mosque, error: mosqueError } = await supabaseAdmin
        .from('mosques')
        .select('city')
        .eq('id', mosqueId)
        .single()
      
      if (mosqueError) throw mosqueError
      if (mosque.city !== profile.city) {
        throw new Error('Forbidden: You can only update mosques in your assigned city.')
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('mosques')
      .update(updates)
      .eq('id', mosqueId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: 'Mosque updated successfully.' }), {
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
