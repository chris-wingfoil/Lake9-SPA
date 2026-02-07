# ?? Lake9 SPA - Prompt Log Future Enhancements

> **Status:** Documented (Not Implemented)  
> **Purpose:** Roadmap for advanced prompt log automation features  
> **Philosophy:** KISS - Build only when needed, document now for planning

---

## ?? Overview

This document outlines potential enhancements to the Prompt Log system. **These are NOT implemented yet** - they're stubs to show the vision and make future development easier.

---

## ?? Planned Enhancements

### 1. ?? Separate Logs Branch Strategy

**Goal:** Keep master clean while preserving full prompt history

**Implementation Plan:**
```bash
# Create logs branch
git checkout -b logs
git push -u origin logs

# Archive old entries (keep only last 10 in master)
npm run log:archive
```

**Features:**
- Automatic archiving of prompts older than 30 days
- Script to move completed prompts to logs branch
- Keep summary in master, full history in logs branch
- Periodic merge for backup

**Files to Create:**
- `tools/log-archiver.js` - Script to move old entries
- `tools/log-merge.js` - Script to merge logs branch periodically

**Commands:**
```json
{
  "scripts": {
    "log:archive": "node tools/log-archiver.js",
    "log:merge": "node tools/log-merge.js"
  }
}
```

**Benefits:**
- Cleaner master branch history
- Full log preserved in logs branch
- Easy to review recent vs. historical prompts

**Complexity:** Low (Git operations, markdown parsing)

---

### 2. ?? Google Drive Sync Integration

**Goal:** Export prompt log to Google Drive for backup and sharing

**Implementation Plan:**
- Add button in SPA: "Export Prompt Log"
- Uses existing `services/driveService.ts`
- Saves `PROMPTS_LOG.md` to designated Drive folder
- Optional: Auto-sync weekly

**Features:**
- Manual export button in Layout header
- Automatic weekly backup to Drive
- Encryption option (uses existing encryptionService)
- Shareable link generation

**Files to Create:**
- `services/promptLogSync.ts` - Drive sync logic
- Add UI button in `components/Layout.tsx`

**Code Snippet (Future):**
```typescript
// services/promptLogSync.ts
import { driveService } from './driveService';
import { encryptionService } from './encryptionService';

export async function exportLogToDrive(encrypt = true) {
  const logContent = await fetch('/PROMPTS_LOG.md').then(r => r.text());
  
  let finalContent = logContent;
  if (encrypt) {
    const key = await encryptionService.generateKey();
    finalContent = await encryptionService.encrypt(logContent, key);
  }
  
  const fileMetadata = {
    name: `PROMPTS_LOG_${new Date().toISOString().split('T')[0]}.md`,
    mimeType: 'text/markdown',
    parents: ['Lake9_Logs'] // Drive folder
  };
  
  await driveService.uploadFile(finalContent, fileMetadata);
  console.log('? Log exported to Drive');
}
```

**UI Addition (Future):**
```typescript
// In Layout.tsx header
<button 
  onClick={() => exportLogToDrive()}
  className="text-sm font-medium px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-800"
>
  ?? Export Log
</button>
```

**Benefits:**
- Off-site backup of prompt history
- Easy sharing with team/stakeholders
- Integrates with existing Drive infrastructure

**Complexity:** Medium (API integration, UI changes)

---

### 3. ?? Git Hooks for Auto-Status Updates

**Goal:** Automatically update prompt status based on Git commits

**Implementation Plan:**
- Install Git hooks via npm script
- Post-commit hook updates PROMPTS_LOG.md
- Links commit hash to prompt entry
- Auto-updates status (In Progress ? Complete)

**Features:**
- Detect prompt number in commit message
- Auto-update table row with commit hash
- Change status based on commit message keywords
- Optional: Push to logs branch automatically

**Files to Create:**
- `.git/hooks/post-commit` - Hook script
- `tools/install-hooks.js` - Hook installer
- `tools/uninstall-hooks.js` - Hook remover

**Hook Logic (Future):**
```bash
#!/bin/bash
# .git/hooks/post-commit

# Get commit message and hash
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git log -1 --pretty=%h)

# Check if commit mentions a prompt
if [[ $COMMIT_MSG =~ \[Prompt\ \#([0-9]{3})\] ]]; then
  PROMPT_NUM="${BASH_REMATCH[1]}"
  
  # Update log with commit hash
  node tools/log-updater.js link $PROMPT_NUM $COMMIT_HASH
  
  # Update status if keywords found
  if [[ $COMMIT_MSG =~ "Complete" ]]; then
    node tools/log-updater.js status $PROMPT_NUM "? Complete"
  fi
fi
```

**Installation:**
```json
{
  "scripts": {
    "hooks:install": "node tools/install-hooks.js",
    "hooks:uninstall": "node tools/uninstall-hooks.js"
  }
}
```

**Commit Message Format:**
```
[Prompt #001] Implement user dashboard

- Added dashboard component
- Integrated with API
- Tests passing

Status: Complete
```

**Benefits:**
- Automatic log updates (no manual editing)
- Traceability (commits linked to prompts)
- Consistent workflow enforcement

**Complexity:** Medium (Git hook management, message parsing)

---

## ?? Additional Future Ideas

### 4. ?? Analytics Dashboard
- Count prompts by status
- Average time to completion
- Most common feedback types
- Visualize with Recharts (already in project)

### 5. ?? Notifications
- Slack/Discord webhook when prompt approved
- Email digest of weekly prompt activity
- Browser notification for status changes

### 6. ?? Search & Filter
- CLI command: `npm run log:search "keyword"`
- Filter by date range, status, source
- Export filtered results to CSV

### 7. ?? AI Integration
- Use Gemini API to suggest prompt numbering
- Auto-categorize prompts (Feature/Bug/Enhancement)
- Generate commit message templates

---

## ??? Implementation Priority

**Phase 1 (Current):**
- ? Basic log structure
- ? Manual entry support
- ? Auto-numbering script

**Phase 2 (Next):**
- ?? Logs branch strategy
- ?? Drive sync integration

**Phase 3 (Future):**
- ?? Git hooks automation
- ?? Analytics dashboard

**Phase 4 (Advanced):**
- ?? Notifications
- ?? Search & filter
- ?? AI integration

---

## ?? Implementation Guidelines

When implementing these features:

1. **Keep it Simple:** No feature should require more than 200 lines of code
2. **Optional by Default:** All automation should be opt-in
3. **Manual Override:** Always allow manual editing of log
4. **Git-Friendly:** Changes should create clean, readable diffs
5. **No Lock-In:** Features should be independent and removable

---

## ?? Notes

- This document is version-controlled with the project
- Update when implementing features (move to "implemented" section)
- Add new ideas as they emerge from usage
- Keep KISS principle: Simple > Complex

---

## ?? Related Files

- [PROMPTS_LOG.md](../PROMPTS_LOG.md) - Main log file
- [tools/log-updater.js](log-updater.js) - Current automation script
- [package.json](../package.json) - npm scripts

---

**Last Updated:** 2026-02-07  
**Status:** Planning & Documentation Phase  
**Next Review:** After 10 prompts logged (or as needed)
