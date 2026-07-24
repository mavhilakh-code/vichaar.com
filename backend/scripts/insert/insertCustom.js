import { supabase } from './utils/supabase.js';

async function run() {
  const customMarkets = [
    {
      question: 'Could an Indian court rule that the Taj Mahal was originally a Shiva temple by Sep 2026?',
      description: 'Resolves YES if any official Indian court rules that the Taj Mahal was originally a Shiva temple before September 30, 2026. Otherwise, resolves NO.',
      category: 'Politics',
      image_url: 'https://images.unsplash.com/photo-1564507592208-0270e53a323c?q=80&w=600&auto=format&fit=crop',
      house_yes_points: 25,
      house_no_points: 25,
      status: 'Active',
      end_date: new Date('2026-09-30T23:59:59Z').toISOString()
    },
    {
      question: 'Could an Indian court rule that the Taj Mahal was originally a Shiva temple by Nov 2026?',
      description: 'Resolves YES if any official Indian court rules that the Taj Mahal was originally a Shiva temple before November 30, 2026. Otherwise, resolves NO.',
      category: 'Politics',
      image_url: 'https://images.unsplash.com/photo-1564507592208-0270e53a323c?q=80&w=600&auto=format&fit=crop',
      house_yes_points: 25,
      house_no_points: 25,
      status: 'Active',
      end_date: new Date('2026-11-30T23:59:59Z').toISOString()
    },
    {
      question: 'Is India planning a complete ban on cryptocurrency trading by Dec 2026?',
      description: 'Resolves YES if the Indian government officially announces a total ban on all cryptocurrency trading by the end of 2026. Resolves NO if regulated trading remains permitted.',
      category: 'Politics',
      image_url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop',
      house_yes_points: 25,
      house_no_points: 25,
      status: 'Active',
      end_date: new Date('2026-12-31T23:59:59Z').toISOString()
    },
    {
      question: 'Will India announce a nationwide social media ban for minors by Dec 2026?',
      description: 'Resolves YES if the Indian government passes legislation or officially announces a nationwide ban on social media usage for minors (under 18) by December 31, 2026.',
      category: 'Politics',
      image_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=600&auto=format&fit=crop',
      house_yes_points: 25,
      house_no_points: 25,
      status: 'Active',
      end_date: new Date('2026-12-31T23:59:59Z').toISOString()
    }
  ];

  for (const market of customMarkets) {
    const { data: existing } = await supabase.from('markets').select('market_id').eq('question', market.question).single();
    if (!existing) {
       const { error } = await supabase.from('markets').insert([market]);
       if (error) console.error('Error inserting:', market.question, error);
       else console.log('✅ Created Custom Market:', market.question);
    } else {
       console.log('Already exists:', market.question);
    }
  }
}
run();
