import { supabase } from './utils/supabase.js';

async function run() {
  const newImage = 'https://images.unsplash.com/photo-1564507592208-0270e53a323c'; // let's try a different one
  // Actually let's use a reliable one
  const safeImage = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600&auto=format&fit=crop';
  
  const { error } = await supabase.from('markets').update({ image_url: safeImage }).like('question', '%[GROUP:breaking-TajMahal]%');
  if (error) console.error(error);
  else console.log('✅ Updated Taj Mahal image');
}
run();
