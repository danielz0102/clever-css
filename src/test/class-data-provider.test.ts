import assert from "node:assert"

import { ClassDataProvider } from "../class-data-provider"
import { TemporalWorkspaceFixture } from "./fixtures/temporal-workspace"

suite("ClassDataProvider", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("loads all CSS files and their classes", async () => {
    const provider = new ClassDataProvider()

    await workspace.createFile(
      "test.css",
      `
      .test-class1 {
        color: red;
      }
      .test-class2 {
        color: blue;
      }
    `
    )

    provider.refresh()

    const fileItems = await provider.getChildren()
    const classItems = await provider.getChildren(fileItems[0])

    assert(fileItems.length >= 1, "Expected at least one CSS file")
    assert(classItems.length === 2, `Expected 2 classes, got ${classItems.length}`)
  })
})
