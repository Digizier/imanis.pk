import fs from 'fs';
import path from 'path';

function findFiles(dir, ext = ['.ts', '.tsx', '.mjs', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, ext));
    } else {
      if (ext.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = findFiles(path.join(process.cwd(), 'src'));

// Inspect files for specific table queries and objects
files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(process.cwd(), filePath);

  if (content.includes('payment_methods') || content.includes('popup_settings') || content.includes('coupons') || content.includes('categories') || content.includes('collections') || content.includes('products') || content.includes('store_settings')) {
    console.log(`\n========================================`);
    console.log(`FILE: ${relPath}`);
    console.log(`========================================`);
    
    // Extract block around table queries
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('.from(') || line.includes('insert(') || line.includes('update(') || line.includes('upsert(') || line.includes('select(')) {
        console.log(`L${idx+1}: ${line.trim()}`);
      }
    });
  }
});
