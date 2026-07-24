import fs from 'fs';
import path from 'path';

const cronDir = path.join(process.cwd(), 'backend', 'cron');
const files = fs.readdirSync(cronDir);

let count = 0;
for (const file of files) {
  if (file.endsWith('.js')) {
    const filePath = path.join(cronDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let updated = false;
    // Replace BASE_LIQUIDITY = 10000 with 100
    if (content.includes('const BASE_LIQUIDITY = 10000;')) {
      content = content.replace(/const BASE_LIQUIDITY = 10000;/g, 'const BASE_LIQUIDITY = 100;');
      updated = true;
    }
    // Also change marketSeeder.js which has a trailing space
    if (content.includes('const BASE_LIQUIDITY = 10000; ')) {
      content = content.replace(/const BASE_LIQUIDITY = 10000; /g, 'const BASE_LIQUIDITY = 100;');
      updated = true;
    }
    
    // Specifically handle breakingSeeder.js
    if (file === 'breakingSeeder.js') {
      if (!content.includes('BASE_LIQUIDITY')) {
         content = content.replace('status: \'Active\',', "status: 'Active',\n          house_yes_points: 50,\n          house_no_points: 50,");
         // Remove the old 0 points
         content = content.replace('house_yes_points: 0,', '');
         content = content.replace('house_no_points: 0,', '');
         updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      count++;
    }
  }
}
console.log('Updated files: ' + count);
