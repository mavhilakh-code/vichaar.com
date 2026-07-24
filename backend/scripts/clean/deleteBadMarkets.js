import { supabase } from './utils/supabase.js';

async function run() {
  const matchStrings = [
    '%Indian cricket team bounce back%',
    '%Akhil Akkineni%',
    '%Lenin%'
  ];

  for (const str of matchStrings) {
    const { data: markets, error: selectError } = await supabase
      .from('markets')
      .select('market_id, question')
      .ilike('question', str);
      
    if (markets && markets.length > 0) {
      console.log('Found ' + markets.length + ' markets for ' + str + '. Deleting...');
      for (const m of markets) {
        const { error } = await supabase.from('markets').delete().eq('market_id', m.market_id);
        if (error) console.error('Failed to delete', m.market_id, error);
        else console.log('✅ Deleted: ' + m.question);
      }
    } else {
      console.log('No markets found matching ' + str);
    }
  }
}
run();
