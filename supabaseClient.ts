import { createClient } from '@supabase/supabase-js';

// URL va KEY ni Supabase-dan olib, shu yerga qo'ying (qo'shtirnoq ichiga)
const supabaseUrl: string = 'https://banvxruumuzmolscskjo.supabase.co';
const supabaseKey: string = 'sb_publishable_N82kvRNsS_-tsfV_QeOzEQ_XoI49vIK'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
