import { supabase } from './utils/supabase.js';

async function addMarket() {
  const { data, error } = await supabase.from('markets').insert({
    question: '[Breaking] Will India announce a nationwide social media ban for minors by the end of 2026?',
    description: 'There are ongoing global discussions and actions (e.g., in Australia) regarding restricting social media access for children and teens. This market resolves to YES if the Government of India introduces and passes a law completely banning social media access for minors nationwide by December 31, 2026.',
    category: 'Politics',
    end_date: '2026-12-31T23:59:59Z',
    image_url: 'https://ui-avatars.com/api/?name=Breaking&background=random&color=fff',
    status: 'Active',
    house_yes_points: 0,
    house_no_points: 0,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Failed to insert market:', error);
  } else {
    console.log('✅ Successfully added Social Media Ban market to Breaking category.');
  }
}

addMarket();
