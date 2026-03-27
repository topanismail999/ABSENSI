import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atenydidkknrojmmksdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0ZW55ZGlka2tucm9qbW1rc2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTI3MjUsImV4cCI6MjA4ODAyODcyNX0.mU_YCS4yt2sqXA_1SCCNQUmk0TlSHKd-gEuGn5Z6TSI';

export const supabase = createClient(supabaseUrl, supabaseKey);
