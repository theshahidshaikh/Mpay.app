// supabase/functions/update-household/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { householdId, updates } = await req.json()

    if (!householdId || !updates) {
      throw new Error('Household ID and updates are required.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update the households table
    const { error: householdError } = await supabaseAdmin
      .from('households')
      .update({
        house_number: updates.house_number,
        head_of_house: updates.head_of_house,
        members_count: updates.members_count,
        contact_number: updates.contact_number,
        annual_amount: updates.annual_amount,
      })
      .eq('id', householdId);

    if (householdError) throw householdError;

    // Also update the associated profile's full_name if it has changed
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ full_name: updates.head_of_house })
        .eq('id', updates.user_id); // Assumes you pass user_id in updates

    if (profileError) console.warn('Could not update profile name:', profileError.message)


    return new Response(JSON.stringify({ message: 'Household updated successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
