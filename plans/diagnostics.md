# Diagnostics Feature

The goal of this feature is to provide diagnostics about unused CSS classes. CSS classes are those who doesn't have any usage in client files.

Diagnostics are provided to the editor through the diagnostic collection API. Each unused class is a warning.

The collection should be updated when events occur. Each time the following events happen, the collection should get all unused classes from a query handler that must be implemented, and then set the diagnostics for each file.

- Extension initialized.
- CSS file changed.
- CSS file deleted.
- Client file changed.
- Client file deleted.
- Extension rescanned.

## Tasks

### Task 1: Create `GetUnusedClasses` query handler

**Depends on:** None

**Description:**
Create a new query handler following the existing pattern (`GetAllClasses`, `GetDefinition`, etc.) that returns CSS classes that have at least one definition but zero usages.

**Files to create:**

- `src/features/get-unused-classes/get-unused-classes-query-handler.ts`

**Contract:**

```typescript
import type { CssClassModel, CssClassIndex } from "../../persistence/css-class-index"

export class GetUnusedClasses {
  constructor(private index: CssClassIndex) {}

  async execute(): Promise<CssClassModel[]> {
    // Returns all models where definitions.length > 0 && usages.length === 0
  }
}
```

### Task 2: Create `DiagnosticsService`

**Depends on:** Task 1

**Description:**
Create a service class that owns a VS Code `DiagnosticCollection`. It uses `GetUnusedClasses` to find unused classes, maps each `Location` to a `vscode.Diagnostic` with `Warning` severity, groups diagnostics by file URI, and calls `set()` on the collection. Also exposes a `dispose()` method.

**Files to create:**

- `src/features/diagnostics/diagnostics-service.ts`

**Contract:**

```typescript
import * as vscode from "vscode"
import type { CssClassIndex } from "../../persistence/css-class-index"
import { GetUnusedClasses } from "../get-unused-classes/get-unused-classes-query-handler"

export class DiagnosticsService {
  private collection: vscode.DiagnosticCollection
  private getUnusedClasses: GetUnusedClasses

  constructor(index: CssClassIndex) {
    this.collection = vscode.languages.createDiagnosticCollection("clever-css")
    this.getUnusedClasses = new GetUnusedClasses(index)
  }

  async refresh(): Promise<void> {
    // 1. Call this.getUnusedClasses.execute()
    // 2. Group diagnostics by definition file URI
    // 3. For each file, map each definition Location to a vscode.Diagnostic
    //    with range from Location.start/end and severity Warning
    // 4. Call this.collection.set(uri, diagnostics) for each file
  }

  dispose(): void {
    this.collection.dispose()
  }
}
```

### Task 3: Wire diagnostics into extension events

**Depends on:** Task 2

**Description:**
Modify `src/extension.ts` to instantiate `DiagnosticsService` and call `refresh()` at every event point specified in the plan. The diagnostics service must also be added to the returned disposables array.

**Files to modify:**

- `src/extension.ts`

**Changes:**

1. Import `DiagnosticsService`
2. After loading definitions and usages in `init()`, create `const diagnostics = new DiagnosticsService(index)`
3. Call `await diagnostics.refresh()` after initial load
4. In `cssFilesWatcher.onDidChange`: add `await diagnostics.refresh()` after `updateDefinitions.from(file)`
5. In `cssFilesWatcher.onDidDelete`: add `await diagnostics.refresh()` after `deleteDefinitions.from(uri.fsPath)`
6. In `clientFilesWatcher.onDidChange`: add `await diagnostics.refresh()` after `updateUsages.from(uri.fsPath)`
7. In `clientFilesWatcher.onDidDelete`: add `await diagnostics.refresh()` after `deleteUsages.from(uri.fsPath)`
8. In `rescan` function: add `await diagnostics.refresh()` after `loadUsages.execute()` and `tree.refresh()`
9. Add `diagnostics` to the returned disposables array

### Task 4: Write tests for `GetUnusedClasses`

**Depends on:** Task 1

**Description:**
Write unit tests following the existing test patterns (using `node:assert`, `suite`/`test`, `CssClassMother`, `makeToken`).

**Files to create:**

- `src/test/unit/services/get-unused-classes.test.ts`

**Test cases:**

1. Returns classes with definitions but no usages
2. Excludes classes with both definitions and usages
3. Excludes classes with no definitions
4. Returns empty array when all classes are used
5. Returns multiple unused classes from different files

## Acceptance Criteria

- [x] Task 1 completed: `GetUnusedClasses` query handler created
- [x] Task 2 completed: `DiagnosticsService` created
- [x] Task 3 completed: diagnostics wired into extension events
- [x] Task 4 completed: `GetUnusedClasses` tests written and passing
- [x] All tests passing (`pnpm run test`)
- [x] Linter passing (`pnpm run lint`)
- [x] Type checks passing (`pnpm run check-types`)
