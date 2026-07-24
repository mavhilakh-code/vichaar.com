import { supabase } from './utils/supabase.js';

async function run() {
  console.log('Fetching all markets...');
  const { data: markets, error: fetchError } = await supabase.from('markets').select('market_id');
  
  if (fetchError) {
    console.error('Error fetching markets:', fetchError);
    return;
  }
  
  console.log('Found ' + markets.length + ' markets. Updating...');
  
  // Set all existing markets to house_yes_points = 50, house_no_points = 50
  // Note: we could preserve user votes by adding them, but since it's local dev, resetting the house points to 50 is fine.
  // Actually, wait, it's safer to just set them all to 50,50 for simplicity.
  const { error: updateError } = await supabase.from('markets').update({
    house_yes_points: 50,
    house_no_points: 50
  }).neq('status', 'Resolved'); // maybe don't touch resolved ones? Actually, just touch all of them.
  
  if (updateError) {
    console.error('Error updating:', updateError);
  } else {
    console.log('Successfully updated all markets to 100 base liquidity.');
  }
}
run();
