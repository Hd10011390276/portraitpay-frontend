const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\app\\portraits\\[id]\\page.tsx', 'utf8');
const lines = content.split('\n');

// Line 403: {licensing === null ? (
// Line 405: ) : (
// This means outer ternary is: licensing === null ? LOADING : CONTENT

// The content (line 406+) is:
// <div className="space-y-2 text-sm">
//   ... lines 407-408 ...
//   {licensing.allowAiLicensing === null ? (   -- nested ternary at line 409
//     <span>(Uses global default)</span>
//   ) : licensing.allowAiLicensing ? (         -- line 411: else-if
//     <span>Allowed</span>
//   ) : (
//     <span>Blocked</span>
//   )}
//   ... rest of div content ...
// </div>

// So the nested ternary at 409 is:
// licensing.allowAiLicensing === null ? val1 : licensing.allowAiLicensing ? val2 : val3

// And the outer ternary at 403's second branch (C) is:
// <div className="space-y-2 text-sm">...{nested ternary}...</div>

// The structure is: {A ? B : C}
// where C contains: {D ? E : F ? G : H}

// But wait! After C (the div from 406-441), line 442 has:
// ) : (
// This is AFTER C ends at line 441. So line 442 tries to add a THIRD branch to the OUTER ternary!
// Outer ternary: {A ? B : C : D}
// where A = licensing === null
// B = <div>Loading...</div> at line 404
// C = <div>...{nested ternary}...</div> at line 406-441
// D = <p>Unable to load...</p> at line 443

// But {A ? B : C : D} parses as {(A ? B : C) : D}
// which is: evaluate A ? B : C, use that result as condition for ? D : E
// That's INVALID because it tries to use a value as a ternary condition!

// The bug: The ternary at line 403 has THREE branches but ternary chaining makes it invalid

// Solution: The outer ternary needs to be restructured. Options:
// 1. Use a wrapper div with conditional inside
// 2. Use && for the else-if
// 3. Restructure the whole conditional

// The intended logic (I think):
// - If licensing === null: show "Loading..."
// - Else if licensing.allowAiLicensing === null: show "Using default"
// - Else if licensing.allowAiLicensing: show "Allowed"
// - Else: show "Blocked"
// - If licensing load failed: show "Unable to load"

// But the current structure has the "Unable to load" as a third branch of the OUTER ternary,
// not as part of the inner ternary chain.

// Fix: change line 403 to not be a ternary, instead use &&
console.log('=== PROBLEM ANALYSIS ===');
console.log('Line 403: {licensing === null ? (');
console.log('Line 405: ) : (');
console.log('Line 406-441: <div> with nested ternary inside');
console.log('Line 441: </div>');
console.log('Line 442: ) : (');
console.log('Line 443: <p>Unable to load...</p>');
console.log('Line 444: )}');
console.log('');
console.log('The ternary at 403 is: A ? B : C : D');
console.log('This parses as: (A ? B : C) ? D : E -- SYNTAX ERROR!');
console.log('');
console.log('=== CORRECT FIX ===');
console.log('Need to restructure so the outer ternary has only 2 branches,');
console.log('or the third branch is part of the nested ternary structure.');
console.log('');
console.log('Simpler fix: use && for the else-if, not nested ternary:');
console.log('{licensing === null && (<div>Loading...</div>)}');
console.log('{licensing !== null && licensing.allowAiLicensing === null && (<span>Using default</span>)}');
console.log('{licensing !== null && licensing.allowAiLicensing === true && (<span>Allowed</span>)}');
console.log('{licensing !== null && licensing.allowAiLicensing === false && (<span>Blocked</span>)}');
console.log('{licensing === undefined && (<p>Unable to load...</p>)}');
console.log('');
console.log('Or restructure with a proper if-else approach inside the JSX.');