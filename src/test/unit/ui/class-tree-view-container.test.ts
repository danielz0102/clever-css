import assert from "node:assert"

import type { CssClassIndex } from "../../../persistence/css-class-index"
import { ClassTreeViewContainer } from "../../../ui/class-tree/class-tree-view-container"

suite("ClassTreeViewContainer", () => {
  test("Both trees show all classes initially", async () => {
    const index: CssClassIndex = new Map()
    index.set("unused-a", {
      className: "unused-a",
      definitions: [
        { uri: "file:///a.css", start: { line: 0, column: 0 }, end: { line: 0, column: 7 } },
      ],
      usages: [],
    })
    index.set("unused-b", {
      className: "unused-b",
      definitions: [
        { uri: "file:///b.css", start: { line: 0, column: 0 }, end: { line: 0, column: 7 } },
      ],
      usages: [],
    })

    const container = await ClassTreeViewContainer.create(index)

    const allFileItems = container.allClassesTree.getChildren()
    const unusedFileItems = container.unusedClassesTree.getChildren()

    assert.strictEqual(allFileItems.length, 2, "allClassesTree should have 2 file items")
    assert.strictEqual(unusedFileItems.length, 2, "unusedClassesTree should have 2 file items")

    for (let i = 0; i < allFileItems.length; i++) {
      const allClasses = container.allClassesTree.getChildren(allFileItems[i])
      const unusedClasses = container.unusedClassesTree.getChildren(unusedFileItems[i])
      assert.strictEqual(allClasses.length, unusedClasses.length)
      assert.strictEqual(allClasses.length, 1, "Each file should have 1 class")
    }
  })

  test("unusedClassesTree excludes classes with usages", async () => {
    const index: CssClassIndex = new Map()
    index.set("unused", {
      className: "unused",
      definitions: [
        { uri: "file:///unused.css", start: { line: 0, column: 0 }, end: { line: 0, column: 6 } },
      ],
      usages: [],
    })
    index.set("used", {
      className: "used",
      definitions: [
        { uri: "file:///used.css", start: { line: 0, column: 0 }, end: { line: 0, column: 4 } },
      ],
      usages: [
        { uri: "file:///app.ts", start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      ],
    })

    const container = await ClassTreeViewContainer.create(index)

    const allFileItems = container.allClassesTree.getChildren()
    assert.strictEqual(allFileItems.length, 2, "allClassesTree should show both files")

    const unusedFileItems = container.unusedClassesTree.getChildren()
    assert.strictEqual(unusedFileItems.length, 1, "unusedClassesTree should show only 1 file")

    const unusedClasses = container.unusedClassesTree.getChildren(unusedFileItems[0])
    assert.strictEqual(unusedClasses.length, 1, "unusedClassesTree should show 1 class")
  })

  test("refreshIndex propagates index changes", async () => {
    const index: CssClassIndex = new Map()
    index.set("class-a", {
      className: "class-a",
      definitions: [
        { uri: "file:///a.css", start: { line: 0, column: 0 }, end: { line: 0, column: 7 } },
      ],
      usages: [],
    })

    const container = await ClassTreeViewContainer.create(index)

    const initialFileItems = container.allClassesTree.getChildren()
    assert.strictEqual(initialFileItems.length, 1, "Should start with 1 file item")

    index.set("class-b", {
      className: "class-b",
      definitions: [
        { uri: "file:///b.css", start: { line: 0, column: 0 }, end: { line: 0, column: 7 } },
      ],
      usages: [],
    })

    await container.refreshIndex()

    const updatedFileItems = container.allClassesTree.getChildren()
    assert.strictEqual(updatedFileItems.length, 2, "allClassesTree should show 2 files after refresh")

    const updatedUnusedItems = container.unusedClassesTree.getChildren()
    assert.strictEqual(
      updatedUnusedItems.length,
      2,
      "unusedClassesTree should show 2 files after refresh"
    )
  })

  test("unusedClassesTree updates when usages change", async () => {
    const index: CssClassIndex = new Map()
    index.set("my-class", {
      className: "my-class",
      definitions: [
        { uri: "file:///styles.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
      usages: [],
    })

    const container = await ClassTreeViewContainer.create(index)

    const initialUnusedItems = container.unusedClassesTree.getChildren()
    assert.strictEqual(initialUnusedItems.length, 1, "unusedClassesTree should show 1 file initially")

    const cls = index.get("my-class")
    assert(cls !== undefined)
    cls.usages = [{ uri: "file:///app.ts", start: { line: 1, column: 0 }, end: { line: 1, column: 8 } }]

    await container.refreshIndex()

    const updatedUnusedItems = container.unusedClassesTree.getChildren()
    assert.strictEqual(
      updatedUnusedItems.length,
      0,
      "unusedClassesTree should be empty after usage added"
    )
  })
})
