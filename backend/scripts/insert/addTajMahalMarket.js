import { supabase } from './utils/supabase.js';

async function addMarket() {
  const { data, error } = await supabase.from('markets').insert({
    question: '[Breaking] Will any Indian court rule that the Taj Mahal was originally a Shiva temple (Tejo Mahalaya) by the end of 2026?',
    description: 'There have been ongoing legal petitions claiming the Taj Mahal was originally a Hindu temple. This market resolves to YES if any recognized Indian court officially rules in favor of this claim by December 31, 2026.',
    category: 'Politics',
    end_date: '2026-12-31T23:59:59Z',
    image_url: 'https://images.unsplash.com/photo-1564507592208-52875692095f?w=400&q=80',
    status: 'Active',
    house_yes_points: 50,
    house_no_points: 50,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Failed to insert market:', error);
  } else {
    console.log('✅ Successfully added Taj Mahal market to Politics category.');
  }
}

addMarket();
