import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify that the user making the request is a super_admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('User not found.')

    const { data: callerProfile } = await supabaseClient
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (callerProfile?.role !== 'super_admin') {
      throw new Error('Forbidden: Only super admins can approve admins.')
    }

    // 2. Get the admin ID to approve from the request body
    const { adminId } = await req.json()
    if (!adminId) throw new Error('Admin ID is required.')

    // 3. Update the admin's status to 'active'
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { error: updateError } = await supabaseAdmin
      .from('admin_profiles')
      .update({ status: 'active' })
      .eq('id', adminId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: 'Admin approved successfully' }), {
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