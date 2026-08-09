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
console.log(`Found ${files.length} source files to inspect.`);

const tableQueries = {};

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(process.cwd(), filePath);
  
  // Match .from('tableName') or .from("tableName")
  const fromMatches = content.matchAll(/\.from\(['"]([^'"]+)['"]\)/g);
  for (const match of fromMatches) {
    const tableName = match[1];
    if (!tableQueries[tableName]) {
      tableQueries[tableName] = [];
    }
    tableQueries[tableName].push(relPath);
  }
});

console.log('--- SUPABASE TABLES USED IN CODEBASE ---');
console.log(JSON.stringify(tableQueries, null, 2));
