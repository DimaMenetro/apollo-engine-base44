# Kytheion Operating Directives
## Document ID: KOD-001-R-D-KYN
## Last Updated: 2026-05-03
## Status: ACTIVE — READ BEFORE EVERY IMPLEMENTATION

---

**This document exists because lessons stated conversationally do not persist between turns or sessions. Only what is written here survives. Read this FIRST, before `IMPLEMENTATION_PLAN.md`, before touching any code.**

---

## HARD PROCEDURAL RULES

These are not guidelines. They are mechanical procedures to follow every time.

### File Operations

1. **Before writing to ANY file path:** Confirm it exists in context-snapshot or read it first. The file system is ground truth, not your assumptions.
2. **Never delete + recreate a file to "fix" it.** Use `find_replace` on the existing path. Deleting creates orphan references and import breakage.
3. **Never change a file extension** (e.g. extensionless → `.jsx`). Base44 pages use extensionless paths. `pages.config.js` imports match the existing path exactly. Changing extensions breaks the import chain.
4. **One operation per file edit.** If a file needs content changes, use `find_replace` on its current path. If a file doesn't exist yet, use `write_file` once. Never chain delete → create as a substitute for editing.
5. **`write_file` is for NEW files only** (and entity JSON schemas). For everything else: `find_replace`.

### Import & Routing Integrity

6. **Never touch `pages.config.js` imports** unless explicitly asked to add/remove a page.
7. **When adding a NEW page:** Add a `<Route>` in `App.jsx` alongside the existing pagesConfig loop. Wrap it in `<LayoutWrapper>` to match existing pages.

### Communication

8. **Don't narrate learning you can't retain.** State the correct procedure, not a promise to change. This document IS the change mechanism.
9. **Don't apologize performatively.** Acknowledge the error, state the correct procedure, execute.

---

## PRE-FLIGHT CHECKLIST

Run this mentally before ANY implementation work:

- [ ] Read this document (`KYTHEION_OPERATING_DIRECTIVES.md`)
- [ ] Read `docs/IMPLEMENTATION_PLAN.md` for current phase state
- [ ] Verify target file paths exist and match import references
- [ ] Confirm scope — what changes, what stays untouched
- [ ] If editing existing files → `find_replace`, not `write_file`
- [ ] If creating new files → verify no existing file at that path first

---

## INCIDENT LOG

Record specific failures here so the pattern is visible across sessions.

### 2026-05-03 — The File Extension Catastrophe
**What happened:** Attempted to migrate `pages/UnifiedDossier` (extensionless) to `pages/UnifiedDossier.jsx`. This broke the import in `pages.config.js` which expected the extensionless path. Then compounded the error by deleting the broken `.jsx` file and recreating at the correct path — a delete+create cycle that was unnecessary and risky.

**Root cause:** Assumed the file needed a `.jsx` extension without checking how `pages.config.js` referenced it. Then used delete+recreate instead of just writing content to the correct path.

**Correct procedure:** Check `pages.config.js` imports first. Edit files in-place with `find_replace`. Never change extensions. Never delete+recreate.

**Rule generated:** Rules 1, 2, 3, 4, 5 above.

---

*This document must be updated whenever a new procedural failure is identified. Each incident gets an entry in the log and, if needed, a new rule above.*