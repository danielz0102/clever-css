import assert from "node:assert"

import type { CssClassIndex } from "../../persistence/css-class-index"
import { ClassTreeViewContainer } from "../../ui/class-tree/class-tree-view-container"
import { CssClassModelMother } from "../fixtures/mothers/css-class-mother"

suite("ClassTreeViewContainer", () => {
  test("unusedClassesTree excludes classes with usages", () => {
    const index: CssClassIndex = new Map([
      [
        "unused",
        CssClassModelMother({
          className: "unused",
          definitions: [{ uri: "file:///unused.css" }],
        }),
      ],
      [
        "used",
        CssClassModelMother({
          className: "used",
          definitions: [{ uri: "file:///used.css" }],
          usages: [{ uri: "file:///app.ts" }],
        }),
      ],
    ])

    const container = ClassTreeViewContainer.create(index)
    const allFileItems = container.allClassesTree.getChildren()

    assert.strictEqual(allFileItems.length, 2, "allClassesTree should show both files")

    const unusedFileItems = container.unusedClassesTree.getChildren()
    assert.strictEqual(unusedFileItems.length, 1, "unusedClassesTree should show only 1 file")

    const unusedClasses = container.unusedClassesTree.getChildren(unusedFileItems[0])
    assert.strictEqual(unusedClasses.length, 1, "unusedClassesTree should show 1 class")
  })

  test("duplicatedClassesTree shows classes with multiple definitions", () => {
    const index: CssClassIndex = new Map([
      [
        "single",
        CssClassModelMother({
          className: "single",
          definitions: [{ uri: "file:///single.css" }],
        }),
      ],
      [
        "duplicated",
        CssClassModelMother({
          className: "duplicated",
          definitions: [{ uri: "file:///a.css" }, { uri: "file:///b.css" }],
        }),
      ],
    ])

    const container = ClassTreeViewContainer.create(index)
    const fileItems = container.duplicatedClassesTree.getChildren()

    assert.strictEqual(fileItems.length, 2, "duplicatedClassesTree should show all definitions")

    const classes = container.duplicatedClassesTree.getChildren(fileItems[0])
    assert.ok(classes[0], "should have a class item")
  })

  test("refresh propagates index changes", () => {
    const index: CssClassIndex = new Map([
      [
        "class-a",
        CssClassModelMother({
          className: "class-a",
          definitions: [{ uri: "file:///a.css" }],
        }),
      ],
    ])

    const container = ClassTreeViewContainer.create(index)

    const initialFileItems = container.allClassesTree.getChildren()
    assert.strictEqual(initialFileItems.length, 1, "Should start with 1 file item")

    index.set(
      "class-b",
      CssClassModelMother({
        className: "class-b",
        definitions: [{ uri: "file:///b.css" }],
      })
    )

    container.refresh()

    const updatedFileItems = container.allClassesTree.getChildren()
    assert.strictEqual(
      updatedFileItems.length,
      2,
      "allClassesTree should show 2 files after refresh"
    )

    const updatedUnusedItems = container.unusedClassesTree.getChildren()
    assert.strictEqual(
      updatedUnusedItems.length,
      2,
      "unusedClassesTree should show 2 files after refresh"
    )
  })
})
