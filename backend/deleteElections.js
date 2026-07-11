import { supabase } from './utils/supabase.js';

async function deleteElections() {
  const { data } = await supabase.from('markets').select('market_id, question, category').eq('category', 'Elections');
  if (!data) return;
  console.log('Found ' + data.length + ' markets with strict category Elections to delete');
  for (const m of data) {
    await supabase.from('markets').delete().eq('market_id', m.market_id);
    console.log('Deleted: ' + m.question);
  }
}
deleteElections();
