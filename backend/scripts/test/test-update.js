import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testUpdate() {
  const { data, error } = await supabase
    .from('markets')
    .update({ 
      status: 'Resolved',
      winning_outcome: 'CANCEL' 
    })
    .eq('market_id', '556c2a96-5bd2-4b5a-a5a2-cc6d149014c1')
    .select();
    
  console.log("Update Data:", data);
  console.log("Update Error:", error);
}

testUpdate();
