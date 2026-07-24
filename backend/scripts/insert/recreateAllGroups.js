import { supabase } from './utils/supabase.js';

async function run() {
  // 1. Delete all old breaking markets
  const { data: existing } = await supabase.from('markets')
    .select('market_id, question')
    .ilike('question', '%[Breaking]%');
  
  for (const m of (existing || [])) {
    await supabase.from('markets').delete().eq('market_id', m.market_id);
    console.log('Deleted old breaking market:', m.question.substring(0, 50));
  }
  
  const { data: existing2 } = await supabase.from('markets')
    .select('market_id, question')
    .ilike('question', '%[GROUP:india-social-media-ban]%');
    
  for (const m of (existing2 || [])) {
    await supabase.from('markets').delete().eq('market_id', m.market_id);
    console.log('Deleted old group market:', m.question.substring(0, 50));
  }

  // 2. Insert new Multi-date Breaking Markets
  const markets = [
    {
      q: '[GROUP:breaking-social-media-ban] By Oct 2026',
      desc: 'Will India announce a nationwide social media ban for minors before this date?',
      end: '2026-10-31T23:59:59Z',
      img: 'https://source.unsplash.com/400x200/?social+media+phone+teenager'
    },
    {
      q: '[GROUP:breaking-social-media-ban] By Dec 2026',
      desc: 'Will India announce a nationwide social media ban for minors before this date?',
      end: '2026-12-31T23:59:59Z',
      img: 'https://source.unsplash.com/400x200/?social+media+phone+teenager'
    },
    {
      q: '[GROUP:breaking-taj-mahal] By Aug 2026',
      desc: 'Will any Indian court rule that the Taj Mahal was originally a Shiva temple before this date?',
      end: '2026-08-31T23:59:59Z',
      img: 'https://source.unsplash.com/400x200/?taj+mahal+agra'
    },
    {
      q: '[GROUP:breaking-taj-mahal] By Dec 2026',
      desc: 'Will any Indian court rule that the Taj Mahal was originally a Shiva temple before this date?',
      end: '2026-12-31T23:59:59Z',
      img: 'https://source.unsplash.com/400x200/?taj+mahal+agra'
    },
    {
      q: '[GROUP:breaking-crypto-ban] By Sep 2026',
      desc: 'Will India pass a bill completely banning cryptocurrency trading before this date?',
      end: '2026-09-30T23:59:59Z',
      img: 'https://source.unsplash.com/400x200/?cryptocurrency+ban+regulation'
    },
    {
      q: '[GROUP:breaking-crypto-ban] By Dec 2026',
      desc: 'Will India pass a bill completely banning cryptocurrency trading before this date?',
      end: '2026-12-31T23:59:59Z',
      img: 'https://source.unsplash.com/400x200/?cryptocurrency+ban+regulation'
    }
  ];

  for (const m of markets) {
    const { error } = await supabase.from('markets').insert({
      question: m.q,
      description: m.desc,
      category: 'Politics',
      end_date: m.end,
      image_url: m.img,
      status: 'Active',
      house_yes_points: 0,
      house_no_points: 0,
      created_at: new Date().toISOString()
    });
    if (error) console.error('Error inserting:', error.message);
    else console.log('Inserted:', m.q);
  }

  console.log('Done!');
}

run();
