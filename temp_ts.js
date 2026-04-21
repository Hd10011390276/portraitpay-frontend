const ts = require('typescript');

const filePath = 'C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\app\\portraits\\[id]\\page.tsx';
const content = require('fs').readFileSync(filePath, 'utf8');

const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

// Get ALL parse errors (not just the first 2)
const errors = sourceFile.parseDiagnostics;
console.log('Total parse errors:', errors.length);
errors.forEach((d, idx) => {
  const pos = d.start || 0;
  const lines = content.substring(0, pos).split('\n');
  const line = lines.length;
  const col = pos - lines.slice(0, -1).reduce((a, l) => a + l.length + 1, 0);
  console.log(`Error ${idx+1} at line ${line}, col ${col}:`, d.messageText);
});

// Also show what character is at byte 20418
console.log('\nChar at byte 20418:', JSON.stringify(content.charAt(20418)));
console.log('Context:', JSON.stringify(content.substring(20400, 20450)));