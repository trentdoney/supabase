import { createClient, SupabaseClient } from '@supabase/supabase-js'

import { type Database } from 'common'

let _supabase: SupabaseClient<Database>

export function supabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

export function supabaseContent() {
  return supabase().schema('content')
}
