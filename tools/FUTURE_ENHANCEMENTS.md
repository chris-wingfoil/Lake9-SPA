# ?? Lake9 SPA - Prompt Log Future Enhancements

> **Status:** Documented (Not Implemented)  
> **Purpose:** Roadmap for advanced prompt log features  
> **Philosophy:** KISS - Build only when needed, document now for planning

---

## ?? Overview

This document outlines potential enhancements to the Prompt Log system. **These are NOT implemented yet** - they're stubs to show the vision and make future development easier.

**Current Features (V2 - Implemented):**
- ? Auto-numbering system (001, 002, 003...)
- ? Priority tracking (P0-P3)
- ? Effort estimation (hours/days)
- ? Dependency tracking (#001, #002)
- ? Analysis dashboard
- ? Priority sorting
- ? Dependency chain visualization
- ? Interactive prompts
- ? Command-line flags

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

### 4. ?? Gantt Chart Visualization
- Visual timeline of prompts
- Show dependencies as arrows
- Highlight critical path
- Export as PNG or SVG
- Integration with existing Recharts library

### 5. ?? Burndown Chart
- Track remaining hours over time
- Sprint planning visualization
- Velocity calculation
- Forecasting completion date

### 6. ?? Time Tracking Integration
- Start/stop timer for prompts
- Track actual hours vs. estimated
- Generate time reports
- Integration with Toggl/Harvest APIs

### 7. ?? GitHub Issues Integration
- Create GitHub issue from prompt
- Sync status bidirectionally
- Link commits to issues automatically
- Close issue when prompt complete

### 8. ?? Notifications
- Slack/Discord webhook when prompt approved
- Email digest of weekly prompt activity
- Browser notification for status changes
- Configurable notification rules

### 9. ?? Advanced Search & Filter
- CLI command: `npm run log:search "keyword"`
- Filter by date range, status, priority, source
- Export filtered results to CSV/JSON
- Saved filter presets

### 10. ?? AI-Powered Features
- Use Gemini API to suggest priorities
- Auto-categorize prompts (Feature/Bug/Enhancement)
- Generate commit message templates
- Predict effort estimates based on description
- Smart dependency detection

### 11. ?? Mobile/Web Dashboard
- React component to display PROMPTS_LOG.md
- Add to Lake9 SPA layout
- Real-time updates via Firebase
- Interactive filtering and sorting

### 12. ?? Milestone Tracking
- Group prompts into milestones/epics
- Track progress by milestone
- Burndown by milestone
- Release planning features

---

## ??? Implementation Priority

**Phase 1 (? COMPLETE - V1):**
- ? Basic log structure (table + detailed entries)
- ? Manual entry support
- ? Auto-numbering script
- ? Status tracking

**Phase 2 (? COMPLETE - V2):**
- ? Priority tracking (P0-P3)
- ? Effort estimation (hours/days)
- ? Dependency tracking
- ? Analysis dashboard
- ? Priority sorting
- ? Dependency chain visualization

**Phase 3 (NEXT - High Priority):**
- ?? Logs branch strategy (archive old prompts)
- ?? Drive sync integration (backup to Google Drive)
- ?? Git hooks automation (auto-link commits)

**Phase 4 (FUTURE - Medium Priority):**
- ?? Gantt chart visualization
- ?? Burndown charts
- ?? Time tracking integration
- ?? GitHub Issues sync

**Phase 5 (ADVANCED - Low Priority):**
- ?? Notifications (Slack/Discord/Email)
- ?? Advanced search & filter
- ?? AI-powered features
- ?? Mobile/Web dashboard
- ?? Milestone tracking

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
**Status:** V2 Implemented - Priority, Hours, Dependencies, Analysis  
**Next Review:** After 10 prompts logged (or when Phase 3 features needed)
