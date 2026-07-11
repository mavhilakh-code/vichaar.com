
import { supabase } from './utils/supabase.js';

async function run() {
  const event_id = 'breaking-Is India planning a complete ban on cryptocurrency trading';
  const searchString = '[GROUP:' + event_id + ']%';
  const { data: ms, error } = await supabase
    .from('markets')
    .select('market_id, question')
    .ilike('question', searchString);
  console.log('Matches:', ms ? ms.length : 0);
  if (ms && ms.length > 0) console.log(ms[0].question);
}
run();
