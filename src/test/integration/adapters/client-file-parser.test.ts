import assert from "node:assert"

import type { ClientFileParser } from "../../../adapters/client-file-parsers/client-file-parser-port"
import { JsxParser } from "../../../adapters/client-file-parsers/jsx-parser-adapter"
import { TemporalWorkspaceFixture } from "../../fixtures/temporal-workspace"

function testParsers(
  parsers: ClientFileParser[],
  title: string,
  testFn: (parser: ClientFileParser) => void | Promise<void>
) {
  for (const parser of parsers) {
    test(`${parser.constructor.name}: ${title}`, async () => {
      await testFn(parser)
    })
  }
}

suite("Client File Parsers", () => {
  const workspace = new TemporalWorkspaceFixture()
  const allParsers = [new JsxParser()]

  teardown(async () => {
    await workspace.teardown()
  })

  testParsers(allParsers, "does not match class name in casual text", async (parser) => {
    const file = await workspace.createFile(
      "index.tsx",
      "<p>A paragraph that has the text button which is casually the same name of a class</p>"
    )

    const usages = parser.parseUsagesFrom(file.fsPath)

    assert(usages.length === 0, "Should not detect class name in casual text")
  })

  testParsers(
    allParsers,
    "detects multiple classes in a single className attribute",
    async (parser) => {
      const file = await workspace.createFile(
        "multiple-classes.tsx",
        `<div className="class-one class-two" />`
      )

      const usages = parser.parseUsagesFrom(file.fsPath)

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
    }
  )

  testParsers(
    allParsers,
    "detects the same class used multiple times in a single className attribute",
    async (parser) => {
      const file = await workspace.createFile(
        "duplicate-classes.tsx",
        `<div className="duplicate-class duplicate-class" />`
      )

      const usages = parser.parseUsagesFrom(file.fsPath)

      const classUsages = usages.filter((u) => u.name === "duplicate-class")
      assert(
        classUsages.length === 2,
        `Expected 2 usages for 'duplicate-class', found ${classUsages.length}`
      )
    }
  )

  testParsers(allParsers, "supports classes inside template strings", async (parser) => {
    const file = await workspace.createFile(
      "with-template-strings.tsx",
      `<div className={\`my-class\`} />`
    )

    const usages = parser.parseUsagesFrom(file.fsPath)

    const classUsages = usages.filter((u) => u.name === "my-class")
    assert(classUsages.length === 1, `Expected 1 usage, found ${classUsages.length}`)
  })

  testParsers(
    allParsers,
    "supports classes inside template strings with expressions",
    async (parser) => {
      const file = await workspace.createFile(
        "with-template-expressions.tsx",
        `<div className={\`my-class \${variable} another-class \`} />`
      )

      const usages = parser.parseUsagesFrom(file.fsPath)

      const myClassUsages = usages.filter((u) => u.name === "my-class")
      assert(myClassUsages.length === 1, `Expected 1 usage, found ${myClassUsages.length}`)

      const anotherClassUsages = usages.filter((u) => u.name === "another-class")
      assert(
        anotherClassUsages.length === 1,
        `Expected 1 usage, found ${anotherClassUsages.length}`
      )
    }
  )

  testParsers(allParsers, "doesn't cache the result of parsing a file", async (parser) => {
    const file = await workspace.createFile("caching.tsx", `<div className="cached-class" />`)

    parser.parseUsagesFrom(file.fsPath)
    await workspace.createFile("caching.tsx", `<div className="cached-class modified-class" />`)

    const usages = parser.parseUsagesFrom(file.fsPath)
    assert(
      usages.length === 2,
      "Should not cache the result of parsing a file, should detect both classes"
    )
  })
})
