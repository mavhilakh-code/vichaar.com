import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovivdmljgszpzzbtupdd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dZdG2BTZZJQ2fmkfnXlp_g_3hPOc-zz';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanMarkets() {
    console.log("Fetching markets...");
    // Fetch all markets
    const { data: markets, error } = await supabase.from('markets').select('market_id, question, category');
    if (error) {
        console.error("Error fetching markets:", error.message);
        return;
    }
    
    const regex = /^(.*?) (above|rain over) (.*?) on (.*?)\?$/i;
    const marketsToDelete = [];
    
    markets.forEach(m => {
        // If it doesn't match the weather regex, mark for deletion
        if (!m.question.match(regex)) {
            marketsToDelete.push(m.market_id);
        }
    });

    console.log(`Found ${marketsToDelete.length} non-weather markets to delete out of ${markets.length} total markets.`);

    if (marketsToDelete.length === 0) {
        console.log("Nothing to delete.");
        return;
    }

    // Delete in batches
    const batchSize = 100;
    for (let i = 0; i < marketsToDelete.length; i += batchSize) {
        const batch = marketsToDelete.slice(i, i + batchSize);
        console.log(`Deleting batch ${i / batchSize + 1}...`);
        
        // Delete votes and comments first to handle foreign key constraints if CASCADE is not enabled
        console.log("Attempting to delete related votes and comments first...");
        await supabase.from('votes').delete().in('market_id', batch);
        await supabase.from('comments').delete().in('market_id', batch);
        
        // Delete markets
        const { error: deleteError } = await supabase.from('markets').delete().in('market_id', batch);
        if (deleteError) {
            console.error(`Failed to delete batch:`, deleteError.message);
        }
    }
    
    console.log("Cleanup complete!");
}

cleanMarkets().catch(console.error);
