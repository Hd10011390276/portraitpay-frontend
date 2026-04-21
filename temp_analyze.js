const fs = require('fs');
const c = fs.readFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\app\\portraits\\[id]\\page.tsx', 'utf8');
const lines = c.split('\n');
// Find what opens the ternary at line 403
// Look backwards from line 403 for the condition
console.log('Looking backwards from line 403:');
for(let i=402; i>=395; i--) {
  console.log(i+1, ':', JSON.stringify(lines[i]));
}
console.log('\nContext around line 340-380:');
for(let i=339; i<380; i++) {
  console.log(i+1, ':', JSON.stringify(lines[i]));
}
console.log('\nLines 290-320:');
for(let i=289; i<320; i++) {
  console.log(i+1, ':', JSON.stringify(lines[i]));
}
console.log('\nFull function containing line 403:');
// Find what function component this is in
let inFunction = false;
let funcName = '';
for(let i=0; i<402; i++) {
  const line = lines[i];
  if(line.includes('function ') || (line.includes('=>') && !line.includes('=>'))) {
    if(line.match(/function\s+\w+|const\s+\w+\s*=|function\s*\(/)) {
      inFunction = true;
      funcName = line.trim();
    }
  }
}
console.log('Approaching line 403:');
for(let i=398; i<403; i++) {
  console.log(i+1, ':', JSON.stringify(lines[i]));
}