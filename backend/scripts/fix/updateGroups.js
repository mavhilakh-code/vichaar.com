import { supabase } from './utils/supabase.js';

async function run() {
  const newGroups = [
    {
      title: "[GROUP:breaking-Is India planning a complete ban on cryptocurrency trading?] ",
      description: "Rumors are circulating that the RBI and Finance Ministry are drafting a new bill to outlaw all private cryptocurrencies in India, following recent tax hikes on virtual digital assets.",
      image_keyword: "cryptocurrency",
      category: "Politics",
      imgUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb70208?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc0NjF8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeXxlbnwwfHx8fDE3MjA2MDAxMjN8MA&ixlib=rb-4.0.3&q=80&w=1080",
      options: [
        { name: "By Oct 2026", end_date: "2026-10-31T23:59:59Z" },
        { name: "By Dec 2026", end_date: "2026-12-31T23:59:59Z" }
      ]
    }
  ];

  for (const group of newGroups) {
    for (const opt of group.options) {
      const questionText = group.title + opt.name;
      const { error } = await supabase.from('markets').insert({
        question: questionText,
        description: group.description,
        category: group.category,
        end_date: opt.end_date,
        image_url: group.imgUrl,
        status: 'Active',
        house_yes_points: 100,
        house_no_points: 100,
      });
      if (error) console.error("Insert error:", error);
      else console.log("Inserted:", questionText);
    }
  }
}

run();
