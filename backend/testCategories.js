import { supabase } from './utils/supabase.js';

async function run() {
  const categories = ['Politics', 'Tech', 'Sports', 'Entertainment', 'Economics', 'Weather', 'Space', 'Crypto', 'Science', 'Finance', 'Startups', 'Real Estate', 'Breaking News', 'World', 'India'];
  
  for (const cat of categories) {
    const { error } = await supabase.from('markets').insert([{
      question: 'Test Category ' + cat,
      description: 'test',
      category: cat,
      image_url: 'test',
      house_yes_points: 25,
      house_no_points: 25,
      status: 'Active',
      end_date: new Date().toISOString()
    }]);
    if (error && error.code === '23514') {
      console.log('❌ Category Rejected: ' + cat);
    } else {
      console.log('✅ Category Accepted: ' + cat);
      await supabase.from('markets').delete().eq('question', 'Test Category ' + cat);
    }
  }
}
run();
