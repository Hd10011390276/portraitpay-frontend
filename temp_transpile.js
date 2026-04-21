const ts = require('typescript');
const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\app\\portraits\\[id]\\page.tsx', 'utf8');
const result = ts.transpileModule(content, {
  compilerOptions: { jsx: ts.JsxEmit.Preserve },
  fileName: 'page.tsx'
});
if (result.diagnostics && result.diagnostics.length > 0) {
  result.diagnostics.forEach(d => console.log('Error:', d.messageText));
} else {
  console.log('Transpiled OK, output length:', result.outputText.length);
  fs.writeFileSync('transpiled.js', result.outputText);
}