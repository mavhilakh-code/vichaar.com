import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovivdmljgszpzzbtupdd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dZdG2BTZZJQ2fmkfnXlp_g_3hPOc-zz';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkMarkets() {
    const { data: markets, error } = await supabase.from('markets').select('market_id, question');
    if (error) {
        console.error("Error fetching markets:", error.message);
        return;
    }
    console.log(`Total markets found: ${markets.length}`);
    const regex = /^(.*?) (above|rain over) (.*?) on (.*?)\?$/i;
    let weather = 0;
    let other = 0;
    markets.forEach(m => {
        if (m.question.match(regex)) weather++;
        else other++;
    });
    console.log(`Weather markets: ${weather}, Other markets: ${other}`);
}

checkMarkets().catch(console.error);
