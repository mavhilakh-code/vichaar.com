import { supabase } from './utils/supabase.js';

async function run() {
  console.log('Fetching all markets...');
  const { data: markets, error: fetchError } = await supabase.from('markets').select('market_id');
  
  if (fetchError) {
    console.error('Error fetching markets:', fetchError);
    return;
  }
  
  console.log('Found ' + markets.length + ' markets. Updating...');
  
  const { error: updateError } = await supabase.from('markets').update({
    house_yes_points: 25,
    house_no_points: 25
  }).neq('status', 'Resolved'); 
  
  if (updateError) {
    console.error('Error updating:', updateError);
  } else {
    console.log('Successfully updated all markets to 50 base liquidity.');
  }
}
run();
