import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Create a reusable headers object with CORS settings
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // This is a preflight request. Respond immediately with the CORS headers.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    // Create an admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update the user's app_metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { app_metadata: { role: 'super_admin' } }
    )

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Include CORS headers in the success response
    })
  } catch (error) {
    return new Response(String(error?.message ?? error), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Include CORS headers in the error response
    })
  }
})