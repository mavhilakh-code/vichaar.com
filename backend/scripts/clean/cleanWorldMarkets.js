import { supabase } from './utils/supabase.js';

// List of Indian city names used in seeder
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata',
  'Hyderabad', 'Jaipur', 'Ahmedabad', 'Pune', 'Lucknow',
  'Guwahati', 'Tezpur', 'Biswanath'
];

/**
 * Deletes all weather markets that are not for Indian cities.
 */
async function cleanWorldWeatherMarkets() {
  console.log('🧹 Starting cleanup of non-Indian weather markets...');
  try {
    const { data: markets, error } = await supabase
      .from('markets')
      .select('market_id, question')
      .eq('category', 'Politics'); // assuming weather markets are stored under Politics
    if (error) throw error;
    if (!markets || markets.length === 0) {
      console.log('No markets found to clean.');
      return;
    }
    const toDelete = markets.filter(m => {
      // Extract city name from question (assumes format "CityName ...");
      const city = m.question.split(' ')[0];
      return !INDIAN_CITIES.includes(city);
    });
    if (toDelete.length === 0) {
      console.log('All existing markets are Indian cities. No cleanup needed.');
      return;
    }
    const ids = toDelete.map(m => m.market_id);
    const { error: delError } = await supabase
      .from('markets')
      .delete()
      .in('market_id', ids);
    if (delError) throw delError;
    console.log(`✅ Deleted ${ids.length} non-Indian weather markets.`);
  } catch (e) {
    console.error('❌ Cleanup failed:', e.message);
  }
}

cleanWorldWeatherMarkets();
