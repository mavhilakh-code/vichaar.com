import { supabase } from './utils/supabase.js';

async function deleteRainMarkets() {
  console.log('🌧️ Starting cleanup of rain markets...');
  try {
    const { data: markets, error } = await supabase
      .from('markets')
      .select('market_id, question')
      .ilike('question', '%rain%');
      
    if (error) throw error;
    
    if (!markets || markets.length === 0) {
      console.log('No rain markets found to clean.');
      return;
    }

    const ids = markets.map(m => m.market_id);
    console.log(`Found ${ids.length} rain markets to delete.`);
    
    const { error: delError } = await supabase
      .from('markets')
      .delete()
      .in('market_id', ids);
      
    if (delError) {
       // if there are foreign key constraints like votes/comments, we can delete them first
       console.log('Cascade failed, attempting manual cascading...');
       await supabase.from('votes').delete().in('market_id', ids);
       await supabase.from('comments').delete().in('market_id', ids);
       await supabase.from('markets').delete().in('market_id', ids);
    }
    
    console.log(`✅ Successfully deleted ${ids.length} rain markets.`);
  } catch (e) {
    console.error('❌ Cleanup failed:', e.message);
  }
}

deleteRainMarkets();
