import { supabase } from './utils/supabase.js';

async function run() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'markets' });
  if (error) {
     console.log('Error fetching schema, likely no RPC. Let us just try to query information_schema.');
     const { data: info, error: infoErr } = await supabase.from('markets').select('category').limit(1);
     console.log(info, infoErr);
  }
}
run();
