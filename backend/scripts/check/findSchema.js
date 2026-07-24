import fs from 'fs';
import path from 'path';

function findSchema(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
      findSchema(fullPath);
    } else if (file.name.endsWith('.sql')) {
      console.log('Found SQL file:', fullPath);
      console.log(fs.readFileSync(fullPath, 'utf8'));
    }
  }
}

findSchema(process.cwd());
