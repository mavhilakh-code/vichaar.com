import fs from 'fs';
import path from 'path';

const cronDir = path.join(process.cwd(), 'backend', 'cron');
const files = fs.readdirSync(cronDir);

for (const file of files) {
  if (file.endsWith('Seeder.js')) {
    const filePath = path.join(cronDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace all category: '...' with category: 'Politics'
    content = content.replace(/category:\s*'[^']+'/g, "category: 'Politics'");
    
    fs.writeFileSync(filePath, content);
  }
}
console.log('Updated all seeders to use Politics category.');
