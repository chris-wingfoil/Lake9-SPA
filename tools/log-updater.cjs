#!/usr/bin/env node
/**
 * Lake9 SPA - Prompt Log Updater
 * 
 * Simple Node.js tool to manage PROMPTS_LOG.md entries
 * No external dependencies - uses only built-in fs/path modules
 * 
 * Usage:
 *   npm run log:add "Description here"
 *   npm run log:status 001 "Complete"
 *   npm run log:view
 */

const fs = require('fs');
const path = require('path');

// Paths
const LOG_PATH = path.join(__dirname, '../PROMPTS_LOG.md');
const BACKUP_DIR = path.join(__dirname, '../.logs-backup');

// Helper: Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Helper: Read log file
function readLog() {
  if (!fs.existsSync(LOG_PATH)) {
    console.error('? PROMPTS_LOG.md not found!');
    process.exit(1);
  }
  return fs.readFileSync(LOG_PATH, 'utf8');
}

// Helper: Write log file
function writeLog(content) {
  fs.writeFileSync(LOG_PATH, content, 'utf8');
}

// Helper: Get next prompt number
function getNextPromptNumber() {
  const content = readLog();
  const matches = content.match(/### Prompt #(\d{3})/g);
  
  if (!matches || matches.length === 0) {
    return '001';
  }
  
  const numbers = matches.map(m => parseInt(m.match(/\d{3}/)[0]));
  const max = Math.max(...numbers);
  return String(max + 1).padStart(3, '0');
}

// Command: Add new prompt entry
function addEntry(description) {
  if (!description || description.trim() === '') {
    console.error('? Description required!');
    console.log('Usage: npm run log:add "Your description here"');
    process.exit(1);
  }

  const number = getNextPromptNumber();
  const date = getCurrentDate();
  
  console.log(`?? Creating Prompt #${number}...`);
  
  // Create table row
  const tableRow = `| ${number} | ${date} | Grok | ${description} | Pending | ?? Pending | - | - | - |`;
  
  // Create detailed entry
  const detailEntry = `
### Prompt #${number} - ${description}
- **Date:** ${date}
- **Source:** [Grok/Chris/Claude - To be specified]
- **Description:** ${description}
- **Claude Recommendation:** 
  - [To be filled during review]
- **Approval Status:** ?? Pending
- **Execution:**
  - [To be filled after execution]
- **Test Results:** [To be filled after testing]
- **Related Commit:** [To be filled after push]

---
`;

  // Read current log
  let content = readLog();
  
  // Insert table row (after header row)
  const tableHeaderEnd = content.indexOf('|---|------|------|');
  if (tableHeaderEnd === -1) {
    console.error('? Could not find table header in log!');
    process.exit(1);
  }
  
  const tableInsertPos = content.indexOf('\n', tableHeaderEnd) + 1;
  content = content.slice(0, tableInsertPos) + tableRow + '\n' + content.slice(tableInsertPos);
  
  // Insert detailed entry (after "## ?? Log Entries" section)
  const detailSectionMatch = content.match(/## .+ Log Entries[^\n]*\n/);
  if (!detailSectionMatch) {
    console.error('? Could not find detail section in log!');
    process.exit(1);
  }
  
  const detailInsertPos = detailSectionMatch.index + detailSectionMatch[0].length;
  content = content.slice(0, detailInsertPos) + '\n' + detailEntry + content.slice(detailInsertPos);
  
  // Write updated log
  writeLog(content);
  
  console.log(`? Created Prompt #${number}: ${description}`);
  console.log(`?? Updated PROMPTS_LOG.md`);
  console.log(`\n?? Next steps:`);
  console.log(`   1. Edit the log to fill in details`);
  console.log(`   2. npm run log:view (to open in VS Code)`);
  console.log(`   3. Commit when ready: git add PROMPTS_LOG.md && git commit -m "Add Prompt #${number}"`);
}

// Command: Update prompt status
function updateStatus(promptNumber, newStatus) {
  if (!promptNumber || !newStatus) {
    console.error('? Both prompt number and status required!');
    console.log('Usage: npm run log:status 001 "Complete"');
    process.exit(1);
  }
  
  // Pad prompt number if needed
  const paddedNumber = promptNumber.padStart(3, '0');
  
  console.log(`?? Updating Prompt #${paddedNumber} status to: ${newStatus}...`);
  
  let content = readLog();
  
  // Update table row status
  const tableRowRegex = new RegExp(`(\\| ${paddedNumber} \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| )[^|]+(\\| [^\\n]+)`, 'g');
  const tableUpdated = content.replace(tableRowRegex, `$1${newStatus}$2`);
  
  if (tableUpdated === content) {
    console.error(`? Prompt #${paddedNumber} not found in table!`);
    process.exit(1);
  }
  
  content = tableUpdated;
  
  // Update detailed entry status (optional - manual edit preferred for details)
  const detailRegex = new RegExp(`(### Prompt #${paddedNumber}[^]*?- \\*\\*Approval Status:\\*\\* )[^\\n]+`, 'g');
  content = content.replace(detailRegex, `$1${newStatus}`);
  
  writeLog(content);
  
  console.log(`? Updated Prompt #${paddedNumber} status to: ${newStatus}`);
  console.log(`?? PROMPTS_LOG.md updated`);
  console.log(`\n?? Commit when ready: git add PROMPTS_LOG.md && git commit -m "Update Prompt #${paddedNumber} status"`);
}

// Command: View log (open in VS Code if available)
function viewLog() {
  console.log(`?? Opening PROMPTS_LOG.md...`);
  
  // Try to open in VS Code
  const { exec } = require('child_process');
  exec(`code "${LOG_PATH}"`, (error) => {
    if (error) {
      // VS Code not available, just show path
      console.log(`?? File location: ${LOG_PATH}`);
      console.log(`?? Open manually in your editor`);
    } else {
      console.log(`? Opened in VS Code`);
    }
  });
}

// Command: Show help
function showHelp() {
  console.log(`
?? Lake9 SPA - Prompt Log Updater

Usage:
  npm run log:add "description"    - Add new prompt entry
  npm run log:status 001 "status"  - Update prompt status
  npm run log:view                 - Open log in VS Code

Examples:
  npm run log:add "Implement user dashboard"
  npm run log:status 001 "? Complete"
  npm run log:status 002 "?? In Progress"
  npm run log:view

Status Options:
  ?? Pending          - Awaiting approval
  ? Approved         - Ready for execution
  ?? In Progress      - Currently executing
  ?? Feedback         - Needs discussion
  ? Complete         - Done and tested
  ? Rejected         - Not proceeding
  ?? Revision         - Needs changes

Manual Editing:
  You can always edit PROMPTS_LOG.md directly in your editor!
  This tool is just for convenience.
`);
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'add':
      addEntry(args.slice(1).join(' '));
      break;
      
    case 'status':
      updateStatus(args[1], args.slice(2).join(' '));
      break;
      
    case 'view':
      viewLog();
      break;
      
    default:
      console.error(`? Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getNextPromptNumber, addEntry, updateStatus, viewLog };
