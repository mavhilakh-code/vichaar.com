import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovivdmljgszpzzbtupdd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dZdG2BTZZJQ2fmkfnXlp_g_3hPOc-zz';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fakeResolve() {
    const { data: markets, error } = await supabase.from('markets').select('*').eq('status', 'Resolved').is('winning_outcome', null);
    if (error) {
        console.error(error);
        return;
    }
    
    for (const m of markets) {
        const outcome = Math.random() > 0.5 ? 'YES' : 'NO';
        await supabase.from('markets').update({ winning_outcome: outcome }).eq('market_id', m.market_id);
    }
    console.log(`Updated ${markets.length} cancelled markets to YES/NO.`);
}

fakeResolve();
