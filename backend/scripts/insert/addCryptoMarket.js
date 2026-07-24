import { supabase } from './utils/supabase.js';

async function addMarket() {
  const { data, error } = await supabase.from('markets').insert({
    question: '[Breaking] Will India announce a blanket ban on cryptocurrencies by the end of 2026?',
    description: 'There are ongoing debates about cryptocurrency regulations in India. This market resolves to YES if the Government of India or the RBI officially announces a blanket ban on the trading, holding, and mining of all private cryptocurrencies before December 31, 2026.',
    category: 'Politics',
    end_date: '2026-12-31T23:59:59Z',
    image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&q=80',
    status: 'Active',
    house_yes_points: 50,
    house_no_points: 50,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Failed to insert market:', error);
  } else {
    console.log('✅ Successfully added Crypto Ban market to Breaking category.');
  }
}

addMarket();
