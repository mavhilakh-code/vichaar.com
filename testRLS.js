import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovivdmljgszpzzbtupdd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dZdG2BTZZJQ2fmkfnXlp_g_3hPOc-zz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRLS() {
    console.log("Checking if we can delete with anon key...");
    // Let's try to fetch first
    const { data, error } = await supabase.from('markets').select('market_id').limit(1);
    if (error) {
        console.error("Select error:", error.message);
        return;
    }
    console.log("Can select:", data);

    // Let's try to delete a non-existent row to see if it throws RLS error or just succeeds (0 deleted)
    const { error: deleteError } = await supabase.from('markets').delete().eq('market_id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error("Delete error:", deleteError.message);
    } else {
        console.log("Delete query succeeded. RLS might allow anon deletes, or it just didn't fail because 0 rows.");
    }
}

checkRLS();
