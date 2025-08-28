import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // NOTE: The check for a logged-in super admin has been removed.

    // Get the new admin's details from the request body
    const { email, password, fullName, role, city, state, contactNumber } = await req.json()
    
    if (!email || !password || !fullName || !role) {
      throw new Error('Missing required fields: fullName, email, password, and role are required.')
    }
    if (role === 'city_admin' && (!city || !state)) {
      throw new Error('City and State are required for city admins.')
    }

    // Create a Supabase Admin client to perform privileged actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create the new user in the auth system
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
           full_name: fullName,
       }
    })
    if (createError) throw new Error(`Authentication error: ${createError.message}`)

    // Insert the new admin's profile into the admin_profiles table with a 'pending' status
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        id: newUser.user.id,
        full_name: fullName,
        email: email,
        contact_number: contactNumber,
        city: role === 'city_admin' ? city : 'National',
        state: role === 'city_admin' ? state : 'National',
        role: role,
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw new Error(`Profile creation error: ${profileError.message}`)
    }

    return new Response(JSON.stringify({ message: 'Admin registration successful! Awaiting approval.' }), {
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