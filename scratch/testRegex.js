import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkRegex() {
    const { data: markets, error } = await supabase.from('markets').select('question');
    if (error) throw error;
    
    let weatherMarkets = 0;
    const regex = /^(.*?) (above|rain over) (.*?) on (.*?)\?$/i;
    markets.forEach(m => {
        const match = m.question.match(regex);
        if (match) {
            weatherMarkets++;
            console.log(`Matched: ${m.question}`);
            console.log(`City: ${match[1]}, Metric: ${match[2]}, Threshold: ${match[3]}, Date: ${match[4]}`);
        }
    });
    console.log(`Total weather markets matched: ${weatherMarkets}`);
}

checkRegex();
