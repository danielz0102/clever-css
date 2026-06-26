import assert from "node:assert"

import { JsxParser } from "../modules/client-files/adapters/parsers/jsx-parser"
import { LoadUsages } from "../modules/client-files/commands/load-usages"
import type { CssClassIndex, CssClassRecord } from "../persistence/class-index"
import { TemporalWorkspaceFixture } from "./fixtures/temporal-workspace"

suite("LoadUsages", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("loads usages for all classes in the repository", async () => {
    const index: CssClassIndex = new Map()
    index.set("my-class", makeRecord("my-class"))

    const file1 = await workspace.createFile("component.tsx", `<div className="my-class" />`)
    const file2 = await workspace.createFile("other.tsx", `<span className="my-class" />`)

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [
      file1.fsPath,
      file2.fsPath,
    ])
    await loadUsages.execute()

    const record = index.get("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 2, `Expected 2 usages, found ${record.usages.length}`)
  })

  test("does not load usages for classes that are not used", async () => {
    const index: CssClassIndex = new Map()
    index.set("unused-class", makeRecord("unused-class"))

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [])
    await loadUsages.execute()

    const record = index.get("unused-class")
    assert(record !== undefined)
    assert(record.usages.length === 0, `Expected 0 usages, found ${record.usages.length}`)
  })

  test("does not match class name in casual text", async () => {
    const index: CssClassIndex = new Map()
    index.set("button", makeRecord("button"))

    const file = await workspace.createFile(
      "index.tsx",
      "<p>A paragraph that has the text button which is casually the same name of a class</p>"
    )

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [file.fsPath])
    await loadUsages.execute()

    const record = index.get("button")
    assert(record?.usages.length === 0, "Should not detect class name in casual text")
  })

  test("detects multiple classes in a single className attribute", async () => {
    const index: CssClassIndex = new Map()
    index.set("class-one", makeRecord("class-one"))
    index.set("class-two", makeRecord("class-two"))

    const file = await workspace.createFile(
      "multiple-classes.tsx",
      `<div className="class-one class-two" />`
    )

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [file.fsPath])
    await loadUsages.execute()

    const classOne = index.get("class-one")
    assert(classOne !== undefined)
    assert(
      classOne.usages.length === 1,
      `Expected 1 usage for 'class-one', found ${classOne.usages.length}`
    )

    const classTwo = index.get("class-two")
    assert(classTwo !== undefined)
    assert(
      classTwo.usages.length === 1,
      `Expected 1 usage for 'class-two', found ${classTwo.usages.length}`
    )
  })

  test("detects the same class used multiple times in a single className attribute", async () => {
    const index: CssClassIndex = new Map()
    index.set("duplicate-class", makeRecord("duplicate-class"))

    const file = await workspace.createFile(
      "duplicate-classes.tsx",
      `<div className="duplicate-class duplicate-class" />`
    )

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [file.fsPath])
    await loadUsages.execute()

    const record = index.get("duplicate-class")
    assert(record !== undefined)
    assert(
      record.usages.length === 2,
      `Expected 2 usages for 'duplicate-class', found ${record.usages.length}`
    )
  })

  test("supports classes inside template strings", async () => {
    const index: CssClassIndex = new Map()
    index.set("my-class", makeRecord("my-class"))

    const file = await workspace.createFile(
      "with-template-strings.tsx",
      `<div className={\`my-class\`} />`
    )

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [file.fsPath])
    await loadUsages.execute()

    const record = index.get("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 1, `Expected 1 usage, found ${record.usages.length}`)
  })

  test("supports classes inside template strings with expressions", async () => {
    const index: CssClassIndex = new Map()
    index.set("my-class", makeRecord("my-class"))
    index.set("another-class", makeRecord("another-class"))

    const file = await workspace.createFile(
      "with-template-expressions.tsx",
      `<div className={\`my-class \${variable} another-class \`} />`
    )

    const loadUsages = new LoadUsages(index, new JsxParser(), async () => [file.fsPath])
    await loadUsages.execute()

    const myClass = index.get("my-class")
    assert(myClass !== undefined)
    assert(myClass.usages.length === 1, `Expected 1 usage, found ${myClass.usages.length}`)

    const anotherClass = index.get("another-class")
    assert(anotherClass !== undefined)
    assert(
      anotherClass.usages.length === 1,
      `Expected 1 usage, found ${anotherClass.usages.length}`
    )
  })
})

function makeRecord(className: string): CssClassRecord {
  return {
    className,
    definitions: [
      { uri: "file:///test.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
    ],
    usages: [],
  }
}
