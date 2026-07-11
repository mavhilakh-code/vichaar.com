import { supabase } from './utils/supabase.js';

async function removeConstraint() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: 'ALTER TABLE markets DROP CONSTRAINT IF EXISTS markets_category_check;'
  });
  console.log(error || 'Constraint removed');
}

removeConstraint();
