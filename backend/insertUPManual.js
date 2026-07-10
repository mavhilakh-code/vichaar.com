import { supabase } from './utils/supabase.js';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
You are a prediction market creator.
Generate a list of ALL major competing political parties or political alliances (up to 10 parties) likely to contest or win the Next Uttar Pradesh Legislative Assembly election, plus a mandatory 'Independent / Other' option.
Include prominent regional parties active in Uttar Pradesh (like RLD, Apna Dal, Nishad Party, SBSP, ASP, etc).
For each party/alliance, assign starting YES and NO points that sum exactly to 50 based on their relative strength.

Return a JSON object exactly in this format, with no markdown formatting or backticks around it:
{
  "groupId": "elections-UttarPradesh2027",
  "questionTitle": "Which party or alliance will win the Uttar Pradesh Legislative Assembly election?",
  "endDate": "2027-03-31T23:59:59Z",
  "description": "This market resolves to YES for the political party or alliance that wins the most seats.",
  "options": [
    { "name": "Bharatiya Janata Party (BJP)", "yes": 25, "no": 25 },
    { "name": "Independent / Other", "yes": 0, "no": 50 }
  ]
}
`;
  
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  const cleanText = response.text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
  const parsedData = JSON.parse(cleanText);

  for (const opt of parsedData.options) {
    const fullQuestion = `[GROUP:${parsedData.groupId}] ${parsedData.questionTitle} ${opt.name}`;
    await supabase.from('markets').insert([{
      question: fullQuestion,
      description: parsedData.description,
      category: 'Politics',
      image_url: null,
      house_yes_points: opt.yes,
      house_no_points: opt.no,
      status: 'Active',
      end_date: parsedData.endDate
    }]);
    console.log(`✅ Created: ${fullQuestion}`);
  }
}
run();
