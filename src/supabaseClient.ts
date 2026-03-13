import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhdevhvgtetobvhkkmmz.supabase.co';
const supabaseAnonKey = 'sb_publishable_gCW--kv_jP-W6JwnBcmabQ_V36Q7KX5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
