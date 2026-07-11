
import { supabase } from './utils/supabase.js';

async function run() {
  const { data: markets } = await supabase.from('markets').select('market_id, house_yes_points, house_no_points');
  const { data: votes } = await supabase.from('votes').select('market_id, choice');
  
  console.log(Markets: , Votes: );
}
run();
