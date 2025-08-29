import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers to allow requests from your deployed website
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // For production, you should replace '*' with your website's domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    if (!filePath) {
      throw new Error('Missing file path in request body');
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate a signed URL for the file that expires in 5 minutes
    const { data, error } = await supabaseAdmin
      .storage
      .from('payment_screenshot') // Ensure this is your correct bucket name
      .createSignedUrl(filePath, 300);

    if (error) throw error;

    return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});