import axios from "axios";
import { supabase } from "../utils/supabase.js";
import { getImageForQuestion, IMAGES } from "../utils/imageHelper.js";

const BASE_LIQUIDITY = 10000;

const CITIES = [
  // 🇮🇳 Popular Indian Cities
  { name: 'Mumbai', lat: 19.07, lon: 72.87, tz: 'Asia/Kolkata' },
  { name: 'Delhi', lat: 28.61, lon: 77.20, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, tz: 'Asia/Kolkata' },
  { name: 'Chennai', lat: 13.08, lon: 80.27, tz: 'Asia/Kolkata' },
  { name: 'Kolkata', lat: 22.57, lon: 88.36, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad', lat: 17.38, lon: 78.48, tz: 'Asia/Kolkata' },
  { name: 'Jaipur', lat: 26.91, lon: 75.79, tz: 'Asia/Kolkata' },
  { name: 'Ahmedabad', lat: 23.02, lon: 72.57, tz: 'Asia/Kolkata' },
  { name: 'Pune', lat: 18.52, lon: 73.85, tz: 'Asia/Kolkata' },
  { name: 'Lucknow', lat: 26.85, lon: 80.95, tz: 'Asia/Kolkata' },
  { name: 'Guwahati', lat: 26.14, lon: 91.73, tz: 'Asia/Kolkata' },
  { name: 'Tezpur', lat: 26.65, lon: 92.79, tz: 'Asia/Kolkata' },
  { name: 'Biswanath', lat: 26.73, lon: 93.15, tz: 'Asia/Kolkata' },
  // 🌍 Popular Global Cities
  { name: 'New York', lat: 40.71, lon: -74.00, tz: 'America/New_York' },
  { name: 'London', lat: 51.50, lon: -0.12, tz: 'Europe/London' },
  { name: 'Tokyo', lat: 35.68, lon: 139.65, tz: 'Asia/Tokyo' },
  { name: 'Sydney', lat: -33.86, lon: 151.20, tz: 'Australia/Sydney' },
  { name: 'Dubai', lat: 25.20, lon: 55.27, tz: 'Asia/Dubai' },
  { name: 'Paris', lat: 48.85, lon: 2.35, tz: 'Europe/Paris' },
  { name: 'Singapore', lat: 1.35, lon: 103.82, tz: 'Asia/Singapore' },
  { name: 'Los Angeles', lat: 34.05, lon: -118.24, tz: 'America/Los_Angeles' },
];
import { GoogleGenAI } from '@google/genai';
async function getGeminiForecast(city) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `You are a weather API. Provide the forecasted maximum temperature (in Celsius) and total precipitation (in mm) for ${city.name}, India for the next 4 days starting from today. 
Return ONLY a valid JSON array of exactly 4 objects. No markdown formatting, no backticks.
Format:
[
  {"date": "YYYY-MM-DD", "max_temp": 32.5, "precip": 1.2},
  {"date": "YYYY-MM-DD", "max_temp": 33.1, "precip": 0.0}
]`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { temperature: 0.1 }
  });
  
  const text = response.text;
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const startIdx = cleanText.indexOf('[');
  const endIdx = cleanText.lastIndexOf(']');
  if (startIdx !== -1 && endIdx !== -1) {
    cleanText = cleanText.substring(startIdx, endIdx + 1);
  }
  return JSON.parse(cleanText);
}

async function seedWeatherMarkets() {
  console.log("🌤️ [Cron] Starting Gemini Weather Market Seeder...");

  let createdCount = 0;

  for (const city of CITIES) {
    try {
      const forecastData = await getGeminiForecast(city);
      if (!forecastData || forecastData.length < 4) continue;

      // Create markets for today (0), tomorrow (1), day after (2), and 3 days from now (3)
      const targetIndices = [0, 1, 2, 3];
      
      for (const targetIndex of targetIndices) {
        const dayData = forecastData[targetIndex];
        const targetDateRaw = dayData.date;
        const targetDate = new Date(targetDateRaw).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        const maxTemp = dayData.max_temp;
        const precip = dayData.precip;
        
        // Thresholds: Temperature (+/- 2 degrees from forecast)
        const thresholdTemp = Math.floor(maxTemp);
        
        const tempQuestion = `${city.name} above ${thresholdTemp}°C on ${targetDate}?`;

        // Market 1: Temperature
        const { data: existingTemp } = await supabase
          .from('markets')
          .select('market_id')
          .eq('question', tempQuestion)
          .single();
          
        if (!existingTemp) {
          const { error } = await supabase.from('markets').insert([{
            question: tempQuestion,
            description: `This market predicts whether the maximum recorded temperature in ${city.name} will exceed ${thresholdTemp}°C on ${targetDate}, based on Gemini AI forecasts.`,
            category: 'Politics', // Route via Politics for DB check constraint
            image_url: getImageForQuestion(tempQuestion),
            house_yes_points: BASE_LIQUIDITY / 2,
            house_no_points: BASE_LIQUIDITY / 2,
            status: 'Active',
            end_date: new Date(`${targetDateRaw}T23:59:59Z`).toISOString()
          }]);

          if (error) {
            console.error(`❌ Failed to insert weather market: ${tempQuestion}`, error);
          } else {
            console.log(`✅ Created Weather Market: ${tempQuestion}`);
            createdCount++;
          }
        }

        // Market 2: Precipitation (only if forecast predicts some rain to make it interesting, or just general)
        if (precip > 0.5) {
          const thresholdRain = Math.floor(precip);
          const rainQuestion = `${city.name} rain over ${thresholdRain}mm on ${targetDate}?`;

          const { data: existingRain } = await supabase
            .from('markets')
            .select('market_id')
            .eq('question', rainQuestion)
            .single();
            
          if (!existingRain) {
            const { error } = await supabase.from('markets').insert([{
              question: rainQuestion,
              description: `This market resolves to Yes if ${city.name} receives more than ${thresholdRain}mm of precipitation on ${targetDate}, according to Gemini AI forecasting.`,
              category: 'Politics', 
              image_url: getImageForQuestion(rainQuestion),
              house_yes_points: BASE_LIQUIDITY / 2,
              house_no_points: BASE_LIQUIDITY / 2,
              status: 'Active',
              end_date: new Date(`${targetDateRaw}T23:59:59Z`).toISOString()
            }]);

            if (error) {
              console.error(`❌ Failed to insert weather market: ${rainQuestion}`, error);
            } else {
              console.log(`✅ Created Weather Market: ${rainQuestion}`);
              createdCount++;
            }
          }
        }
      }

    } catch (error) {
      console.error(`❌ Error fetching Gemini data for ${city.name}:`, error.message);
    }
  }

  console.log(`🏁 [Cron] Weather Seeder finished. Created ${createdCount} markets.`);
}

export {  seedWeatherMarkets  };
