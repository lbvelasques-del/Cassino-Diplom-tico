import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tieduoyppbigsaxxjhfl.supabase.co'
const supabaseKey = 'sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2'

export const supabase = createClient(supabaseUrl, supabaseKey)
