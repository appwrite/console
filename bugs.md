# VectorDB Console Bugs

> VectorsDB shares the `collection-[collection]` route with documentsdb -- no separate pages needed.
> The `sdk.ts` abstraction (`useDatabaseSdk`) already handles all three types.
> The `.bind()` ternary in spreadsheet.svelte is intentional -- sdk.ts returns `Record` types but the spreadsheet expects raw `Models.Document`. Refactoring would require touching the entire document pipeline.

## ~~Critical -- Will break vectorsdb in production~~ FIXED

### ~~1. `collection-[collection]/+page.ts` -- listDocuments hardcoded to `documentsDB`~~ FIXED

### ~~2. `collection-[collection]/+page.svelte` -- EmptySheet type hardcoded to `"documentsdb"`~~ FIXED

### ~~3. `empty.svelte` -- vectorsdb gets tablesdb layout~~ FIXED

### ~~4. `empty.svelte` CSS -- no vectorsdb selector~~ FIXED

### ~~5. `empty.svelte` -- index-only check excludes vectorsdb~~ FIXED

---

## ~~Major -- UX bugs~~ FIXED

### ~~6. Keyboard hint hardcodes `Cmd` (macOS only)~~ FIXED

### 7. `Mod-g` conflicts with browser "Find next"

**File:** `editor/view.svelte:1137`
`Cmd+G` / `Ctrl+G` is the standard "Find next" shortcut after `Cmd+F`.
**Status:** Deprioritized -- CodeMirror captures keys when focused, minor edge case.

---

## Minor -- Cleanup / consistency

### 9. `getCollectionService()` type signature too broad

**File:** `(entity)/helpers/sdk.ts:118`
Accepts all `DatabaseType` but only handles `documentsdb` and `vectorsdb`. Calling with `legacy` or `tablesdb` throws at runtime.
**Fix:** Narrow parameter type to `Extract<DatabaseType, 'documentsdb' | 'vectorsdb'>`.

### 10. `create.svelte` -- `dimension` not reset on modal close

**File:** `(entity)/views/create.svelte`
`id` and `name` are reset in `updateAndCleanup()` but `dimension` is not. Reopening the modal after creating a collection with dimension 1536 will still show 1536.
**Fix:** Add `dimension = 768;` to the reset paths.

### 11. `create.svelte` -- No max bound on dimension input

**File:** `(entity)/views/create.svelte`
The `InputNumber` has `min={1}` but no `max`. A user could enter an arbitrarily large value.
**Fix:** Add a sensible `max` (e.g., 16384).

### 12. Magic number `768` repeated

**Files:** `create.svelte:39`, `+layout.svelte:277`
**Fix:** Extract to a constant like `DEFAULT_VECTOR_DIMENSION`.
