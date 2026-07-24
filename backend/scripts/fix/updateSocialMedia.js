import { supabase } from './utils/supabase.js';

async function run() {
  const newGroup = {
    title: "[GROUP:breaking-Will the government of India ban social media for minors?] ",
    description: "In a landmark move, the central government is considering legislation to ban all social media platforms for citizens under the age of 18, citing severe mental health concerns and algorithmic addiction. This market resolves based on official Parliament bills passed.",
    image_keyword: "social media teen phone",
    category: "Politics",
    options: [
      { name: "By Oct 2026", end_date: "2026-10-31T23:59:59Z" },
      { name: "By Dec 2026", end_date: "2026-12-31T23:59:59Z" }
    ]
  };

  const fetchedImg = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc0NjF8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMHRlZW4lMjBwaG9uZXxlbnwwfHx8fDE3MjA2MDAzNjh8MA&ixlib=rb-4.0.3&q=80&w=1080';

  for (const opt of newGroup.options) {
    const questionText = newGroup.title + opt.name;
    const { error } = await supabase.from('markets').insert({
      question: questionText,
      description: newGroup.description,
      category: newGroup.category,
      end_date: opt.end_date,
      image_url: fetchedImg,
      status: 'Active',
      house_yes_points: 100,
      house_no_points: 100,
    });
    if (error) console.error("Insert error:", error);
    else console.log("Inserted:", questionText);
  }
}

run();
