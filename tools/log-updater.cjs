#!/usr/bin/env node
/**
 * Lake9 SPA - Prompt Log Updater V2
 * 
 * Enhanced with Priority, Hours, Dependencies, and Analysis features
 * No external dependencies - uses only built-in fs/path/readline modules
 * 
 * Usage:
 *   npm run log:add "Description"
 *   npm run log:add "Description" --priority P1 --hours 6h --depends "#001"
 *   npm run log:status 001 "Complete"
 *   npm run log:analyze
 *   npm run log:priority
 *   npm run log:deps
 *   npm run log:view
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const LOG_PATH = path.join(__dirname, '../PROMPTS_LOG.md');

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

// Helper: Parse command line flags
function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const flag = args[i].substring(2);
      flags[flag] = args[i + 1] || true;
      i++;
    }
  }
  return flags;
}

// Helper: Prompt user for input
async function prompt(question, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const promptText = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Command: Add new prompt entry (enhanced with priority, hours, dependencies)
async function addEntry(args) {
  const flags = parseFlags(args);
  const description = args.filter(a => !a.startsWith('--') && a !== flags.priority && a !== flags.hours && a !== flags.depends).join(' ');
  
  if (!description || description.trim() === '') {
    console.error('? Description required!');
    console.log('Usage: npm run log:add "Your description here" [--priority P1] [--hours 6h] [--depends "#001"]');
    process.exit(1);
  }

  const number = getNextPromptNumber();
  const date = getCurrentDate();
  
  console.log(`?? Creating Prompt #${number}...`);
  console.log('');
  
  // Get priority (from flag or prompt)
  let priority = flags.priority;
  if (!priority) {
    priority = await prompt('Priority (P0/P1/P2/P3)', 'P2');
  }
  
  // Validate priority
  if (!['P0', 'P1', 'P2', 'P3'].includes(priority.toUpperCase())) {
    console.error('? Invalid priority! Use P0, P1, P2, or P3');
    process.exit(1);
  }
  priority = priority.toUpperCase();
  
  // Get hours (from flag or prompt)
  let hours = flags.hours;
  if (!hours) {
    hours = await prompt('Estimated hours (e.g., 2h, 8h, 1d)', '4h');
  }
  
  // Get dependencies (from flag or prompt)
  let depends = flags.depends;
  if (!depends) {
    depends = await prompt('Dependencies (e.g., #001 or None)', 'None');
  }
  
  // Create table row (updated format with priority, hours, depends)
  const tableRow = `| ${number} | ${priority} | ${hours} | ${depends} | ${date} | Grok | ${description} | ?? Pending | - | - | - |`;
  
  // Create detailed entry
  const detailEntry = `
### Prompt #${number} - ${description}
- **Date:** ${date}
- **Priority:** ${priority} ${getPriorityLabel(priority)}
- **Estimated Hours:** ${hours}
- **Dependencies:** ${depends}
- **Source:** [Grok/Chris/Claude - To be specified]
- **Description:** ${description}
- **Claude Recommendation:** 
  - [To be filled during review]
- **Approval Status:** ?? Pending
- **Execution:**
  - [To be filled after execution]
- **Test Results:** [To be filled after testing]
- **Related Commit:** [To be filled after push]
- **Actual Hours:** [To be filled]
- **Blockers:** ${depends !== 'None' ? `Waiting on ${depends}` : 'None'}

---
`;

  // Read current log
  let content = readLog();
  
  // Insert table row (after header row)
  const tableHeaderMatch = content.match(/\|\s*#\s*\|\s*Pri\s*\|\s*Hrs\s*\|[^\n]+\n\|[-|]+\|\s*\n/);
  if (!tableHeaderMatch) {
    console.error('? Could not find table header in log!');
    process.exit(1);
  }
  
  const tableInsertPos = tableHeaderMatch.index + tableHeaderMatch[0].length;
  content = content.slice(0, tableInsertPos) + tableRow + '\n' + content.slice(tableInsertPos);
  
  // Insert detailed entry (after "## ?? Log Entries" section)
  const detailSectionMatch = content.match(/## ?? Log Entries[^\n]*\n+/);
  if (!detailSectionMatch) {
    console.error('? Could not find detail section in log!');
    process.exit(1);
  }
  
  const detailInsertPos = detailSectionMatch.index + detailSectionMatch[0].length;
  content = content.slice(0, detailInsertPos) + detailEntry + content.slice(detailInsertPos);
  
  // Write updated log
  writeLog(content);
  
  console.log('');
  console.log(`? Created Prompt #${number}: ${description}`);
  console.log(`   Priority: ${priority} | Hours: ${hours} | Depends: ${depends}`);
  console.log(`?? Updated PROMPTS_LOG.md`);
  console.log(`\n?? Next steps:`);
  console.log(`   1. Review and edit details: npm run log:view`);
  console.log(`   2. Run analysis: npm run log:analyze`);
  console.log(`   3. Commit when ready: git add PROMPTS_LOG.md && git commit -m "Add Prompt #${number}"`);
}

// Helper: Get priority label
function getPriorityLabel(priority) {
  const labels = {
    'P0': '(Critical)',
    'P1': '(High)',
    'P2': '(Medium)',
    'P3': '(Low)'
  };
  return labels[priority] || '';
}

// Command: Generate analysis dashboard
function generateAnalysis() {
  console.log('?? Generating Analysis Dashboard...\n');
  
  const content = readLog();
  
  // Parse all prompts from table
  const tableRowRegex = /\|\s*(\d{3})\s*\|\s*(P\d)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;
  const prompts = [];
  let match;
  
  while ((match = tableRowRegex.exec(content)) !== null) {
    prompts.push({
      number: match[1].trim(),
      priority: match[2].trim(),
      hours: match[3].trim(),
      depends: match[4].trim(),
      date: match[5].trim(),
      from: match[6].trim(),
      description: match[7].trim(),
      status: match[8].trim(),
      outcome: match[9].trim(),
      test: match[10].trim(),
      commit: match[11].trim()
    });
  }
  
  if (prompts.length === 0) {
    console.log('??  No prompts found in log!');
    return;
  }
  
  // Calculate statistics
  const complete = prompts.filter(p => p.status.includes('Complete')).length;
  const inProgress = prompts.filter(p => p.status.includes('Progress')).length;
  const pending = prompts.filter(p => p.status.includes('Pending')).length;
  const blocked = prompts.filter(p => p.depends !== 'None' && !p.status.includes('Complete')).length;
  
  // Calculate effort
  const totalHours = prompts.reduce((sum, p) => {
    const hours = parseHours(p.hours);
    return sum + hours;
  }, 0);
  
  const completedHours = prompts
    .filter(p => p.status.includes('Complete'))
    .reduce((sum, p) => sum + parseHours(p.hours), 0);
  
  const remainingHours = totalHours - completedHours;
  
  // Priority breakdown
  const p0Complete = prompts.filter(p => p.priority === 'P0' && p.status.includes('Complete')).length;
  const p0Pending = prompts.filter(p => p.priority === 'P0' && !p.status.includes('Complete')).length;
  const p1Complete = prompts.filter(p => p.priority === 'P1' && p.status.includes('Complete')).length;
  const p1Pending = prompts.filter(p => p.priority === 'P1' && !p.status.includes('Complete')).length;
  const p2Complete = prompts.filter(p => p.priority === 'P2' && p.status.includes('Complete')).length;
  const p2Pending = prompts.filter(p => p.priority === 'P2' && !p.status.includes('Complete')).length;
  const p3Complete = prompts.filter(p => p.priority === 'P3' && p.status.includes('Complete')).length;
  const p3Pending = prompts.filter(p => p.priority === 'P3' && !p.status.includes('Complete')).length;
  
  // Print analysis
  console.log('?? ANALYSIS DASHBOARD');
  console.log('?'.repeat(60));
  console.log('');
  console.log('Feature Completion Status:');
  console.log(`  ? Built & Deployed: ${complete} prompt(s)`);
  console.log(`  ?? In Progress: ${inProgress} prompt(s)`);
  console.log(`  ?? Pending: ${pending} prompt(s)`);
  console.log(`  ??  Blocked: ${blocked} prompt(s)`);
  console.log('');
  console.log('Effort Summary:');
  console.log(`  Total Estimated: ${totalHours}h`);
  console.log(`  Completed: ${completedHours}h (${Math.round(completedHours/totalHours*100)}%)`);
  console.log(`  Remaining: ${remainingHours}h`);
  console.log('');
  console.log('Priority Breakdown:');
  console.log(`  P0 (Critical): ${p0Complete} complete, ${p0Pending} pending`);
  console.log(`  P1 (High): ${p1Complete} complete, ${p1Pending} pending`);
  console.log(`  P2 (Medium): ${p2Complete} complete, ${p2Pending} pending`);
  console.log(`  P3 (Low): ${p3Complete} complete, ${p3Pending} pending`);
  console.log('');
  console.log('?'.repeat(60));
  
  // Show next actions
  console.log('');
  console.log('?? Next Actions:');
  const readyPrompts = prompts.filter(p => 
    !p.status.includes('Complete') && 
    (p.depends === 'None' || checkDependenciesMet(p.depends, prompts))
  );
  
  if (readyPrompts.length > 0) {
    console.log('  Ready to start:');
    readyPrompts.slice(0, 5).forEach(p => {
      console.log(`    - Prompt #${p.number}: ${p.description} (${p.priority}, ${p.hours})`);
    });
  } else {
    console.log('  ? All ready prompts complete!');
  }
  
  // Show blocked
  const blockedPrompts = prompts.filter(p => 
    !p.status.includes('Complete') && 
    p.depends !== 'None' && 
    !checkDependenciesMet(p.depends, prompts)
  );
  
  if (blockedPrompts.length > 0) {
    console.log('');
    console.log('  ??  Blocked prompts:');
    blockedPrompts.forEach(p => {
      console.log(`    - Prompt #${p.number}: ${p.description} (waiting on ${p.depends})`);
    });
  }
  
  console.log('');
}

// Helper: Parse hours string to number
function parseHours(hoursStr) {
  if (!hoursStr || hoursStr === '-') return 0;
  
  const match = hoursStr.match(/(\d+)(h|d)/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  return unit === 'd' ? value * 8 : value;
}

// Helper: Check if dependencies are met
function checkDependenciesMet(dependsStr, prompts) {
  if (dependsStr === 'None') return true;
  
  const deps = dependsStr.split(',').map(d => d.trim().replace('#', ''));
  return deps.every(dep => {
    const depPrompt = prompts.find(p => p.number === dep);
    return depPrompt && depPrompt.status.includes('Complete');
  });
}

// Command: Show prompts sorted by priority
function showPriority() {
  console.log('?? Prompts by Priority...\n');
  
  const content = readLog();
  const tableRowRegex = /\|\s*(\d{3})\s*\|\s*(P\d)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;
  const prompts = [];
  let match;
  
  while ((match = tableRowRegex.exec(content)) !== null) {
    prompts.push({
      number: match[1].trim(),
      priority: match[2].trim(),
      hours: match[3].trim(),
      depends: match[4].trim(),
      description: match[7].trim(),
      status: match[8].trim()
    });
  }
  
  // Sort by priority, then by number
  prompts.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority.localeCompare(b.priority);
    }
    return a.number.localeCompare(b.number);
  });
  
  // Group by priority
  ['P0', 'P1', 'P2', 'P3'].forEach(pri => {
    const priPrompts = prompts.filter(p => p.priority === pri);
    if (priPrompts.length > 0) {
      console.log(`\n${pri} ${getPriorityLabel(pri)}:`);
      priPrompts.forEach(p => {
        const statusIcon = p.status.includes('Complete') ? '?' : 
                          p.status.includes('Progress') ? '??' : '??';
        console.log(`  ${statusIcon} #${p.number}: ${p.description} (${p.hours}, depends: ${p.depends})`);
      });
    }
  });
  
  console.log('');
}

// Command: Show dependency chain
function showDependencies() {
  console.log('?? Dependency Chain...\n');
  
  const content = readLog();
  const tableRowRegex = /\|\s*(\d{3})\s*\|\s*(P\d)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;
  const prompts = [];
  let match;
  
  while ((match = tableRowRegex.exec(content)) !== null) {
    prompts.push({
      number: match[1].trim(),
      depends: match[4].trim(),
      description: match[7].trim(),
      status: match[8].trim()
    });
  }
  
  // Build dependency tree
  prompts.forEach(p => {
    const statusIcon = p.status.includes('Complete') ? '?' : 
                      p.status.includes('Progress') ? '??' : 
                      p.status.includes('Blocked') ? '??' : '??';
    
    if (p.depends === 'None') {
      console.log(`${statusIcon} #${p.number}: ${p.description}`);
      console.log(`  ?? No dependencies`);
    } else {
      console.log(`${statusIcon} #${p.number}: ${p.description}`);
      const deps = p.depends.split(',').map(d => d.trim());
      deps.forEach(dep => {
        const depPrompt = prompts.find(pr => `#${pr.number}` === dep);
        if (depPrompt) {
          const depStatus = depPrompt.status.includes('Complete') ? '?' : '?? BLOCKS';
          console.log(`  ?? Depends on ${dep}: ${depPrompt.description} ${depStatus}`);
        }
      });
    }
    console.log('');
  });
}

// Command: Update prompt status
function updateStatus(promptNumber, newStatus) {
  if (!promptNumber || !newStatus) {
    console.error('? Both prompt number and status required!');
    console.log('Usage: npm run log:status 001 "Complete"');
    process.exit(1);
  }
  
  const paddedNumber = promptNumber.padStart(3, '0');
  console.log(`?? Updating Prompt #${paddedNumber} status to: ${newStatus}...`);
  
  let content = readLog();
  
  // Update table row status (adjusted for new column format)
  const tableRowRegex = new RegExp(`(\\| ${paddedNumber} \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| )[^|]+(\\| [^\\n]+)`, 'g');
  const tableUpdated = content.replace(tableRowRegex, `$1${newStatus}$2`);
  
  if (tableUpdated === content) {
    console.error(`? Prompt #${paddedNumber} not found in table!`);
    process.exit(1);
  }
  
  content = tableUpdated;
  
  // Update detailed entry status
  const detailRegex = new RegExp(`(### Prompt #${paddedNumber}[^]*?- \\*\\*Approval Status:\\*\\* )[^\\n]+`, 'g');
  content = content.replace(detailRegex, `$1${newStatus}`);
  
  writeLog(content);
  
  console.log(`? Updated Prompt #${paddedNumber} status to: ${newStatus}`);
  console.log(`?? PROMPTS_LOG.md updated`);
  console.log(`\n?? Next steps:`);
  console.log(`   1. Run analysis: npm run log:analyze`);
  console.log(`   2. Commit: git add PROMPTS_LOG.md && git commit -m "Update Prompt #${paddedNumber} status"`);
}

// Command: View log
function viewLog() {
  console.log(`?? Opening PROMPTS_LOG.md...`);
  
  const { exec } = require('child_process');
  exec(`code "${LOG_PATH}"`, (error) => {
    if (error) {
      console.log(`?? File location: ${LOG_PATH}`);
      console.log(`?? Open manually in your editor`);
    } else {
      console.log(`? Opened in VS Code`);
    }
  });
}

// Command: Complete prompt (stub for V2.1)
function completePrompt(promptNumber, actualHours) {
  console.log('?? Feature coming in V2.1!');
  console.log(`?? For now, manually update Prompt #${promptNumber} in PROMPTS_LOG.md:`);
  console.log(`   - Set Act column to: ${actualHours || '[actual hours]'}`);
  console.log(`   - Calculate Var: (Actual - Estimated) / Estimated * 100%`);
  console.log(`   - Set Status to: ? Complete`);
  console.log(`\n?? Or use: npm run log:view`);
}



// Command: Show help
function showHelp() {
  console.log(`
?? Lake9 SPA - Prompt Log Updater V2.1

Usage:
  npm run log:add "description" [options]  - Add new prompt entry
  npm run log:status 001 "status"          - Update prompt status
  npm run log:complete 001 8h              - Mark complete with actual hours
  npm run log:analyze                      - Generate analysis dashboard
  npm run log:priority                     - View prompts by priority
  npm run log:deps                         - Show dependency chain
  npm run log:view                         - Open log in VS Code

Add Options:
  --priority P0/P1/P2/P3                   - Set priority
  --hours 2h/8h/1d                         - Set estimated hours
  --depends "#001" or "#001,#003"          - Set dependencies

Examples:
  npm run log:add "Implement user dashboard"
  npm run log:add "Export feature" --priority P1 --hours 6h --depends "#001"
  npm run log:status 001 "? Complete"
  npm run log:complete 001 8h
  npm run log:analyze
  npm run log:priority
  npm run log:deps

Priority Levels:
  P0 - Critical (drop everything, blocks all work)
  P1 - High (important, near-term deadline)
  P2 - Medium (standard priority, normal planning)
  P3 - Low (nice-to-have, can be deferred)

Manual Editing:
  You can always edit PROMPTS_LOG.md directly!
  This tool is just for convenience.
`);
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'add':
      await addEntry(args.slice(1));
      break;
      
    case 'status':
      updateStatus(args[1], args.slice(2).join(' '));
      break;
      
    case 'complete':
      completePrompt(args[1], args[2]);
      break;
      
    case 'analyze':
      generateAnalysis();
      break;
      
    case 'priority':
      showPriority();
      break;
      
    case 'deps':
      showDependencies();
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

module.exports = { getNextPromptNumber, addEntry, updateStatus, generateAnalysis, showPriority, showDependencies, viewLog };
