import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tieduoyppbigsaxxjhfl.supabase.co'
const supabaseKey = 'COLA_A_TUA_CHAVE_PUBLISHABLE_AQUI'

export const supabase = createClient(supabaseUrl, supabaseKey)
