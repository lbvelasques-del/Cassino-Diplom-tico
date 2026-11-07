import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exemplo.supabase.co'
const supabaseKey = 'exemplo-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
