---
type: feature
date: 7/23/2026
---

# Unused Classes Tree View

This feature implements a new tree view to display only the CSS classes that are unused in the workspace. Unused classes are those that have zero usages.

This tree can reuse the existing [`ClassTreeDataProvider`](../src/ui/class-tree/class-tree-data-provider.ts), but the set of data it receives is different.

The data it receives is the filtered file index that contains unused classes. The tree data should refresh when:

- A client file is changed, or deleted.
- A CSS file is changed, or deleted.
- When the index is rescanned.

For more cleanliness, both trees can be encapsulated along with the data it receives, maybe in a `ClassTreeViewContainer` class. This class may be responsible for creating both tree views and expose a method to refresh the whole index, and then refresh the trees internally. In that case, the whole file index should refresh every time a client file or CSS file is changed or deleted, and when the index is rescanned.

## Tasks

### Task 1: Create `ClassTreeViewContainer`

**Depends on:** None

**Description:**
Create a new class that encapsulates both tree views ("All Classes" and "Unused Classes") along with their data sources. This replaces the manual tree creation and refresh wiring currently spread across `extension.ts`.

The container instantiates `GetAllClasses` and `GetUnusedClasses` internally, creates a `ClassTreeDataProvider` for each, and exposes a `refreshIndex()` method that refreshes both trees in parallel.

**Files to create:**

- `src/ui/class-tree/class-tree-view-container.ts`

**Contract:**

```typescript
import * as vscode from "vscode"
import type { CssClassIndex } from "../../persistence/css-class-index"
import { GetAllClasses } from "../../features/get-all-classes/get-all-classes-query-handler"
import { GetUnusedClasses } from "../../features/diagnostics/get-unused-classes-query-handler"
import { ClassTreeDataProvider } from "./class-tree-data-provider"
import { modelsToIndex } from "./files-index"

export class ClassTreeViewContainer {
  readonly allClassesTree: ClassTreeDataProvider
  readonly unusedClassesTree: ClassTreeDataProvider
  private getAll: GetAllClasses
  private getUnusedClasses: GetUnusedClasses

  private constructor(
    allClassesTree: ClassTreeDataProvider,
    unusedClassesTree: ClassTreeDataProvider,
    getAll: GetAllClasses,
    getUnusedClasses: GetUnusedClasses
  ) {
    this.allClassesTree = allClassesTree
    this.unusedClassesTree = unusedClassesTree
    this.getAll = getAll
    this.getUnusedClasses = getUnusedClasses
  }

  static async create(index: CssClassIndex): Promise<ClassTreeViewContainer> {
    const getAll = new GetAllClasses(index)
    const getUnusedClasses = new GetUnusedClasses(index)

    const allClassesTree = await ClassTreeDataProvider.create(async () =>
      modelsToIndex(await getAll.execute())
    )
    const unusedClassesTree = await ClassTreeDataProvider.create(async () =>
      modelsToIndex(await getUnusedClasses.execute())
    )

    return new ClassTreeViewContainer(allClassesTree, unusedClassesTree, getAll, getUnusedClasses)
  }

  async refreshIndex(): Promise<void> {
    await Promise.all([this.allClassesTree.refresh(), this.unusedClassesTree.refresh()])
  }
}
```

### Task 2: Wire `ClassTreeViewContainer` into the extension

**Depends on:** Task 1

**Description:**
Modify `src/extension.ts` to use `ClassTreeViewContainer` instead of manually creating and wiring the single `ClassTreeDataProvider`. The container replaces the manual `tree` variable, the `getAll`/`GetAllClasses` instantiation, and the manual `tree.refresh()` calls. The `unusedClasses` view (already declared in `package.json`) gets its provider registered.

**Files to modify:**

- `src/extension.ts`

**Changes:**

1. Add import for `ClassTreeViewContainer`
2. Remove imports for `GetAllClasses`, `ClassTreeDataProvider`, and `modelsToIndex` (no longer needed directly)
3. Replace the manual tree creation:

   ```typescript
   // Before
   const getAll = new GetAllClasses(index)
   const tree = await ClassTreeDataProvider.create(async () =>
     modelsToIndex(await getAll.execute())
   )

   // After
   const trees = await ClassTreeViewContainer.create(index)
   ```

4. Replace all `tree.refresh()` calls with `trees.refreshIndex()` (in `cssFilesWatcher.onDidChange`, `cssFilesWatcher.onDidDelete`, and `rescan`)
5. Register both tree providers in the returned disposables:
   ```typescript
   vscode.window.registerTreeDataProvider("classes", trees.allClassesTree),
   vscode.window.registerTreeDataProvider("unusedClasses", trees.unusedClassesTree),
   ```

### Task 3: Write tests for `ClassTreeViewContainer`

**Depends on:** Task 1

**Description:**
Write unit tests for the container class. Since `ClassTreeViewContainer.create()` requires the global `index`, tests should manipulate the index between calls to verify refresh behavior.

**Files to create:**

- `src/test/unit/ui/class-tree-view-container.test.ts`

**Test cases:**

1. **Both trees show all classes initially** — create a container with a populated index, verify both `allClassesTree` and `unusedClassesTree` return the same file/class structure.
2. **`unusedClassesTree` excludes classes with usages** — add a class with usages to the index, verify `unusedClassesTree` doesn't show it while `allClassesTree` does.
3. **`refreshIndex` propagates index changes** — modify the index (add/remove classes) and call `refreshIndex()`, verify both trees reflect the updated state.
4. **`unusedClassesTree` updates when usages change** — add a class with no usages, verify it appears in unused tree; then add usages to that class and call `refreshIndex()`, verify it disappears from unused tree.

## Acceptance Criteria

- [x] Task 1 completed: `ClassTreeViewContainer` created
- [x] Task 2 completed: extension wired to use `ClassTreeViewContainer`
- [x] Task 3 completed: `ClassTreeViewContainer` tests written and passing
- [x] All tests passing (`pnpm run test`)
- [x] Linter passing (`pnpm run lint`)
- [x] Type checks passing (`pnpm run check-types`)
