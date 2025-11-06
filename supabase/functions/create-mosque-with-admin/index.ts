// supabase/functions/create-mosque-with-admin/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the SERVICE_ROLE key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the data from the request body
    const { admin_email, admin_name, name, address, annual_amount } = await req.json();

    // 1. Create the new user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: admin_email,
      email_confirm: true, // User will be created but will need to confirm email
      user_metadata: {
        full_name: admin_name,
        // It's good practice to store the role in metadata too
        role: 'mosque_admin',
      },
    });

    if (authError) throw authError;
    const newUserId = authData.user.id;

    // 2. Call the database function to create the profile and mosque
    const { error: rpcError } = await supabaseAdmin.rpc('create_profile_and_mosque', {
      admin_id: newUserId,
      admin_email: admin_email,
      admin_name: admin_name,
      mosque_name: name,
      mosque_address: address,
      annual_amount: annual_amount,
    });

    if (rpcError) {
      // If this step fails, we need to roll back by deleting the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw rpcError;
    }

    // 3. Optionally, send an invitation email
    await supabaseAdmin.auth.admin.inviteUserByEmail(admin_email);


    return new Response(JSON.stringify({ message: 'mosque and admin created successfully!' }), {
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