import { supabase } from './utils/supabase.js';

async function run() {
  // 1. Delete existing single social media market
  const { data: existing } = await supabase.from('markets')
    .select('market_id, question')
    .ilike('question', '%social media ban%');
  
  for (const m of (existing || [])) {
    await supabase.from('markets').delete().eq('market_id', m.market_id);
    console.log('Deleted:', m.question.substring(0, 60));
  }

  // 2. Insert two grouped markets (short + long timeframe)
  const bannerImg = 'https://source.unsplash.com/400x200/?social+media+phone+teenager';
  const markets = [
    {
      question: '[GROUP:india-social-media-ban] By October 2026',
      description: 'India has been discussing restricting social media for minors amid growing concerns about mental health and screen time. Resolves YES if the Government of India passes a nationwide social media ban for minors before October 31, 2026.',
      category: 'Politics',
      end_date: '2026-10-31T23:59:59Z',
      image_url: bannerImg,
      status: 'Active',
      house_yes_points: 0,
      house_no_points: 0,
    },
    {
      question: '[GROUP:india-social-media-ban] By December 2026',
      description: 'India has been discussing restricting social media for minors amid growing concerns about mental health and screen time. Resolves YES if the Government of India passes a nationwide social media ban for minors before December 31, 2026.',
      category: 'Politics',
      end_date: '2026-12-31T23:59:59Z',
      image_url: bannerImg,
      status: 'Active',
      house_yes_points: 0,
      house_no_points: 0,
    }
  ];

  for (const m of markets) {
    const { error } = await supabase.from('markets').insert({ ...m, created_at: new Date().toISOString() });
    if (error) console.error('Error:', error.message);
    else console.log('Inserted:', m.question);
  }

  console.log('Done!');
}

run();
