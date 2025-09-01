import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client to securely get the logged-in user from their token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Authentication error: User not found')
    }

    const { profileUpdates, mosqueUpdates } = await req.json()
    if (!profileUpdates || !mosqueUpdates) {
      throw new Error('Profile and mosque update data are required.');
    }
    
    // Create a Supabase admin client to perform the updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Update the user's personal details in the correct 'admin_profiles' table
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .update({
        full_name: profileUpdates.full_name,
        contact_number: profileUpdates.contact_number,
      })
      .eq('id', user.id); // Security: Use the authenticated user's ID

    if (profileError) throw profileError;

    // 2. Update the mosque's details, including the new upi_id
    const { error: mosqueError } = await supabaseAdmin
      .from('mosques')
      .update({
        name: mosqueUpdates.name,
        address: mosqueUpdates.address,
        annual_amount: mosqueUpdates.annual_amount,
        upi_id: mosqueUpdates.upi_id, // Ensure UPI ID is included
      })
      .eq('admin_id', user.id); // Security: Only update the mosque this user administers

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

