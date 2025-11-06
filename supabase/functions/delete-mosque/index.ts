// supabase/functions/delete-mosque/index.ts

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
      throw new Error('Forbidden: You do not have permission to delete mosques.')
    }

    // Both super_admin and city_admin can delete mosques.
    if (profile.role !== 'super_admin' && profile.role !== 'city_admin') {
      throw new Error('Forbidden: Your role does not permit this action.')
    }

    const { mosqueId } = await req.json()
    if (!mosqueId) throw new Error('mosque ID is required.')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: mosque, error: mosqueError } = await supabaseAdmin
      .from('mosques')
      .select('admin_id, city')
      .eq('id', mosqueId)
      .single()

    if (mosqueError) throw new Error('mosque not found or could not be fetched.')

    // Security check for city-scoped admins
    if (profile.role === 'city_admin' && profile.city !== mosque.city) {
      throw new Error('Forbidden: You can only delete mosques in your assigned city.')
    }

    const adminIdToDelete = mosque.admin_id;

    // Unlink the admin from the mosque first
    const { error: unlinkError } = await supabaseAdmin
      .from('mosques')
      .update({ admin_id: null })
      .eq('id', mosqueId)

    if (unlinkError) throw new Error(`Failed to unlink admin: ${unlinkError.message}`)

    // Now, safely delete the mosque
    const { error: deletemosqueError } = await supabaseAdmin
      .from('mosques')
      .delete()
      .eq('id', mosqueId)

    if (deletemosqueError) throw deletemosqueError

    // Finally, if an admin was linked, delete their auth account.
    if (adminIdToDelete) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
        adminIdToDelete
      )
      if (deleteUserError) {
        throw new Error(`mosque was deleted, but failed to delete the admin user: ${deleteUserError.message}`);
      }
    }

    return new Response(JSON.stringify({ message: 'mosque and associated admin deleted successfully.' }), {
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
