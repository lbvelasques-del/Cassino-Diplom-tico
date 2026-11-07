import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tieduoyppbigsaxxhjfl.supabase.co';
const supabaseKey = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZWR1b3lwcGJpZ3NheHhqaGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NzcyNDYsImV4cCI6MjEwOTU1MzI0Nn0.ATIFUupi8lQDXLY5kpbrQSsidNaP7nzBKf7EKlSiNSI';

export const supabase = createClient(supabaseUrl, supabaseKey);
