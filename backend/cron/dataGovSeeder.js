import axios from "axios";
import { supabase } from "../utils/supabase.js";
import { getImageForQuestion } from "../utils/imageHelper.js";

const BASE_LIQUIDITY = 100;
const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY;

// Known Resource ID for Real time Air Quality Index
const AQI_RESOURCE_ID = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"; 

const TARGET_CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad'];

export async function seedDataGovMarkets() {
  console.log("🇮🇳 [Cron] Starting Data.gov.in API Seeder...");

  if (!DATAGOV_API_KEY) {
    console.error("❌ DATAGOV_API_KEY is missing. Skipping data.gov.in seeder.");
    return;
  }

  let createdCount = 0;

  try {
    // 1. Fetch AQI Data
    const aqiUrl = `https://api.data.gov.in/resource/${AQI_RESOURCE_ID}?api-key=${DATAGOV_API_KEY}&format=json&limit=100`;
    
    let aqiData;
    try {
      const resp = await axios.get(aqiUrl, { timeout: 10000 });
      aqiData = resp.data;
    } catch (apiError) {
      console.error(`⚠️ data.gov.in API error (Rate limit or downtime): ${apiError.message}`);
      return; // Exit early if API is down
    }

    if (aqiData && aqiData.records && aqiData.records.length > 0) {
      for (const city of TARGET_CITIES) {
        // Find the record for the city
        const record = aqiData.records.find(r => 
          r.city && r.city.toLowerCase() === city.toLowerCase() && 
          r.pollutant_id === 'PM2.5' // Use PM2.5 as the primary index
        ) || aqiData.records.find(r => 
          r.city && r.city.toLowerCase() === city.toLowerCase()
        );

        if (record && record.pollutant_max) {
          const currentAqiMax = parseInt(record.pollutant_max, 10);
          if (isNaN(currentAqiMax)) continue;

          // Create a market threshold: current max + 20%
          const threshold = Math.ceil(currentAqiMax * 1.2 / 10) * 10; // Round to nearest 10
          
          // Target date: end of current week
          const today = new Date();
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + (7 - today.getDay())); // Next Sunday
          const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          const question = `Will ${city}'s AQI exceed ${threshold} by ${dateStr}?`;
          
          const { data: existing } = await supabase
            .from('markets')
            .select('market_id')
            .eq('question', question)
            .single();
            
          if (!existing) {
            const { error } = await supabase.from('markets').insert([{
              question: question,
              description: `This market predicts whether the Air Quality Index (AQI) in ${city} will exceed ${threshold} by ${dateStr}. Current max AQI is ${currentAqiMax}. Data sourced from the official Government of India Open Data Portal (data.gov.in).`,
              category: 'Weather',
              image_url: getImageForQuestion(question),
              house_yes_points: BASE_LIQUIDITY / 2,
              house_no_points: BASE_LIQUIDITY / 2,
              status: 'Active',
              end_date: targetDate.toISOString()
            }]);

            if (error) {
              console.error(`❌ Failed to insert data.gov.in AQI market for ${city}:`, error);
            } else {
              console.log(`✅ Created data.gov.in AQI Market: ${question}`);
              createdCount++;
            }
          }
        }
      }
    } else {
       console.log("⚠️ No valid records found in data.gov.in response.");
    }

    // You can add more API calls here for other datasets (like Wholesale Price Index, etc.)
    // if their Resource IDs are known.

  } catch (error) {
    console.error("❌ Error in data.gov.in seeder:", error);
  }

  console.log(`🏁 [Cron] Data.gov.in Seeder finished. Created ${createdCount} markets.`);
}
