import dotenv from 'dotenv';
dotenv.config(); // Ensure it runs in the backend dir where .env lives
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function cleanMarkets() {
    console.log("Fetching markets...");
    const { data: markets, error } = await supabase.from('markets').select('market_id, question');
    if (error) {
        console.error(error);
        return;
    }
    
    const regex = /^(.*?) (above|rain over) (.*?) on (.*?)\?$/i;
    const marketsToDelete = [];
    
    markets.forEach(m => {
        if (!m.question.match(regex)) {
            marketsToDelete.push(m.market_id);
        }
    });

    console.log(`Found ${marketsToDelete.length} non-weather markets to delete out of ${markets.length} total markets.`);

    if (marketsToDelete.length === 0) {
        console.log("Nothing to delete.");
        return;
    }

    // Delete in batches to avoid URL too long or payload too large
    const batchSize = 100;
    for (let i = 0; i < marketsToDelete.length; i += batchSize) {
        const batch = marketsToDelete.slice(i, i + batchSize);
        console.log(`Deleting batch ${i / batchSize + 1}...`);
        
        // Let's rely on ON DELETE CASCADE if it exists. If it fails, we will manually delete votes first.
        const { error: deleteError } = await supabase.from('markets').delete().in('market_id', batch);
        if (deleteError) {
            console.error(`Failed to delete batch:`, deleteError);
            // Fallback: Delete votes and comments first
            console.log("Attempting to delete related votes and comments first...");
            await supabase.from('votes').delete().in('market_id', batch);
            await supabase.from('comments').delete().in('market_id', batch);
            await supabase.from('markets').delete().in('market_id', batch);
        }
    }
    
    console.log("Cleanup complete!");
}

cleanMarkets().catch(console.error);
