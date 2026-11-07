import { createClient } from '@supabase/supabase-js';

// 1. Substitui o texto entre os parênteses retos pelo ID que acabaste de copiar
const supabaseUrl = 'https://[COLA-O-TEU-PROJECT-ID-AQUI].supabase.co'; 

// 2. A tua chave pública exata
const supabaseKey = 'Sb_publishable_EvhGbTRSSqDK426spZx1sw_uRhXIJX2';

export const supabase = createClient(supabaseUrl, supabaseKey);
