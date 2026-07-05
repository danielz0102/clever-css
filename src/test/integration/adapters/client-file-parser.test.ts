import assert from "node:assert"

import { JsxParser } from "../../../adapters/client-file-parsers/jsx-parser-adapter"
import { TemporalWorkspaceFixture } from "../../fixtures/temporal-workspace"

suite("JsxParser", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("does not match class name in casual text", async () => {
    const parser = new JsxParser()
    const file = await workspace.createFile(
      "index.tsx",
      "<p>A paragraph that has the text button which is casually the same name of a class</p>"
    )

    const usages = parser.getUsagesFrom(file.fsPath)

    assert(usages.length === 0, "Should not detect class name in casual text")
  })

  test("detects multiple classes in a single className attribute", async () => {
    const parser = new JsxParser()
    const file = await workspace.createFile(
      "multiple-classes.tsx",
      `<div className="class-one class-two" />`
    )

    const usages = parser.getUsagesFrom(file.fsPath)

    const classOneUsages = usages.filter((u) => u.name === "class-one")
    assert(
      classOneUsages.length === 1,
      `Expected 1 usage for 'class-one', found ${classOneUsages.length}`
    )

    const classTwoUsages = usages.filter((u) => u.name === "class-two")
    assert(
      classTwoUsages.length === 1,
      `Expected 1 usage for 'class-two', found ${classTwoUsages.length}`
    )
  })

  test("detects the same class used multiple times in a single className attribute", async () => {
    const parser = new JsxParser()
    const file = await workspace.createFile(
      "duplicate-classes.tsx",
      `<div className="duplicate-class duplicate-class" />`
    )

    const usages = parser.getUsagesFrom(file.fsPath)

    const classUsages = usages.filter((u) => u.name === "duplicate-class")
    assert(
      classUsages.length === 2,
      `Expected 2 usages for 'duplicate-class', found ${classUsages.length}`
    )
  })

  test("supports classes inside template strings", async () => {
    const parser = new JsxParser()
    const file = await workspace.createFile(
      "with-template-strings.tsx",
      `<div className={\`my-class\`} />`
    )

    const usages = parser.getUsagesFrom(file.fsPath)

    const classUsages = usages.filter((u) => u.name === "my-class")
    assert(classUsages.length === 1, `Expected 1 usage, found ${classUsages.length}`)
  })

  test("supports classes inside template strings with expressions", async () => {
    const parser = new JsxParser()
    const file = await workspace.createFile(
      "with-template-expressions.tsx",
      `<div className={\`my-class \${variable} another-class \`} />`
    )

    const usages = parser.getUsagesFrom(file.fsPath)

    const myClassUsages = usages.filter((u) => u.name === "my-class")
    assert(myClassUsages.length === 1, `Expected 1 usage, found ${myClassUsages.length}`)

    const anotherClassUsages = usages.filter((u) => u.name === "another-class")
    assert(anotherClassUsages.length === 1, `Expected 1 usage, found ${anotherClassUsages.length}`)
  })
})
