// supabase/functions/unified-signup/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let newUserId: string | undefined;

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const {
      email, password, fullName, city, state,
      role, contactNumber, 
      mosqueId, householdDetails, mosqueDetails,
    } = await req.json()

    if (!email || !password || !fullName || !role) {
      throw new Error('Missing required fields.')
    }

    // Step 1: Create the user in auth.users without metadata
    const { data: { user }, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    })

    if (signUpError) throw new Error(`Auth Error: ${signUpError.message}`);
    if (!user) throw new Error('Sign up failed, user not created.')
    
    newUserId = user.id;

    // --- Role-Specific Logic ---
    if (role === 'mosque_admin') {
      if (!mosqueDetails || !city || !state) throw new Error('mosque details, city, and state are required.');
      
      // --- FIX: Create profile in 'profiles' table, not 'admin_profiles' ---
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: user.id,
            full_name: fullName,
            email: email,
            phone: contactNumber, // Use the 'phone' column
            city: city,
            state: state,
            role: 'mosque_admin',
            status: 'pending'
        });
      if(profileError) throw new Error(`Profile Creation Error: ${profileError.message}`);
      // --- END FIX ---

      // Step 3a: Create the mosque
      const { error: mosqueError } = await supabaseAdmin
        .from('mosques')
        .insert({
          name: mosqueDetails.name,
          address: mosqueDetails.address,
          annual_amount: mosqueDetails.annual_amount || 0,
          city: city,
          state: state,
          admin_id: user.id,
          status: 'pending'
        })
      if (mosqueError) throw new Error(`mosque Creation Error: ${mosqueError.message}`);

    } else if (role === 'household') {
      if (!householdDetails || !mosqueId) throw new Error('Household details and a selected mosque are required.');
      
      // Step 2b: Create the household profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: user.id,
            full_name: fullName,
            email: email,
            phone: householdDetails.contact_number,
            city: city,
            state: state,
            role: 'household',
            status: 'pending'
        });
      if(profileError) throw new Error(`Profile Creation Error: ${profileError.message}`);

      // Step 3b: Create the household entry
      const { error: householdError } = await supabaseAdmin
        .from('households')
        .insert({
          house_number: householdDetails.house_number,
          head_of_house: fullName,
          members_count: householdDetails.members_count,
          male_count: householdDetails.male_count,
          female_count: householdDetails.female_count,
          contact_number: householdDetails.contact_number,
          mosque_id: mosqueId,
          user_id: user.id,
          annual_amount: householdDetails.annual_amount,
          status: 'pending'
        })
      if (householdError) throw new Error(`Household Creation Error: ${householdError.message}`);
    }

    return new Response(JSON.stringify({ message: 'Sign up successful! Your registration is pending approval.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // If any step fails after the user is created, delete the orphaned auth user
    if (newUserId) {
      const supabaseAdminForCleanup = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await supabaseAdminForCleanup.auth.admin.deleteUser(newUserId);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
