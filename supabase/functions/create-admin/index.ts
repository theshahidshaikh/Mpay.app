import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Extract user data from the request body
    const { email, password, fullName, role, contactNumber, city, state } = await req.json();

    // Basic validation
    if (!email || !password || !fullName || !role) {
      throw new Error('Missing required fields: email, password, fullName, and role are required.');
    }
    if (role === 'city_admin' && (!city || !state)) {
      throw new Error('City and State are required for City Admins.');
    }

    // 2. Create a Supabase admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Create the new user in the 'auth.users' table
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm the email, since this is an admin-created user
      app_metadata: {
        role: role // Securely set the role here
      },
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) throw authError;
    if (!user) throw new Error('User creation failed.');

    // 4. Insert the corresponding profile into the 'admin_profiles' table
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        id: user.id, // Link to the auth user
        email: user.email,
        full_name: fullName,
        role: role,
        contact_number: contactNumber,
        city: city,
        state: state,
        status: 'pending' // Set an initial status for approval
      });

    if (profileError) {
      // If profile insertion fails, we should delete the auth user to avoid orphaned accounts
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    // 5. Return a success response
    return new Response(JSON.stringify({ message: 'Admin user created successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
