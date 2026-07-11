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
    if (content.includes('const BASE_LIQUIDITY = 100;')) {
      content = content.replace(/const BASE_LIQUIDITY = 100;/g, 'const BASE_LIQUIDITY = 50;');
      updated = true;
    }
    
    if (file === 'breakingSeeder.js') {
      if (content.includes('house_yes_points: 50')) {
         content = content.replace(/house_yes_points: 50/g, 'house_yes_points: 25');
         content = content.replace(/house_no_points: 50/g, 'house_no_points: 25');
         updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      count++;
    }
  }
}
console.log('Updated seeders: ' + count);
