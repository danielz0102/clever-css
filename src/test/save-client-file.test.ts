import assert from "node:assert"

import { JsxParser } from "../modules/client-files/adapters/parsers/jsx-parser"
import { SaveClientFileV2 } from "../modules/client-files/commands/save-client-file"
import type { CssClassIndex } from "../persistence/class-index"
import { TemporalWorkspaceFixture } from "./fixtures/temporal-workspace"

suite("SaveClientFileV2", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("loads all classes found", async () => {
    const index: CssClassIndex = new Map()
    index.set("my-class", {
      className: "my-class",
      definitions: [
        { uri: "file:///test.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
      usages: [
        {
          uri: "file:///load-trigger.tsx",
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      ],
    })
    index.set("other-class", {
      className: "other-class",
      definitions: [
        { uri: "file:///test.css", start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      ],
      usages: [
        {
          uri: "file:///load-trigger.tsx",
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      ],
    })

    const uri = await workspace.createFile(
      "component.tsx",
      `<div className="my-class other-class">`
    )

    const saveClientFile = new SaveClientFileV2(index, new JsxParser())
    await saveClientFile.execute(uri.fsPath)

    const myClassUsages = index.get("my-class")!.usages
    const otherClassUsages = index.get("other-class")!.usages

    assert(
      myClassUsages.length === 2,
      `Expected 2 usages for 'my-class', got ${myClassUsages.length}`
    )
    assert(
      otherClassUsages.length === 2,
      `Expected 2 usages for 'other-class', got ${otherClassUsages.length}`
    )
    assert(myClassUsages[1]!.uri === uri.fsPath, "Expected the second usage to be in the test file")
    assert(
      otherClassUsages[1]!.uri === uri.fsPath,
      "Expected the second usage to be in the test file"
    )
  })

  test("supports classes inside template strings", async () => {
    const index: CssClassIndex = new Map()
    index.set("my-class", {
      className: "my-class",
      definitions: [
        { uri: "file:///test.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
      usages: [
        {
          uri: "file:///load-trigger.tsx",
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      ],
    })

    const uri = await workspace.createFile("component.tsx", `<div className={\`my-class\`}>`)

    const saveClientFile = new SaveClientFileV2(index, new JsxParser())
    await saveClientFile.execute(uri.fsPath)

    assert(
      index.get("my-class")!.usages.length === 2,
      "Expected the class usage to be loaded from template string"
    )
  })
})
