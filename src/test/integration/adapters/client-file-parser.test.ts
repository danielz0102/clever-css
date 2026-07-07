import assert from "node:assert"

import {
  HtmlParserTextContext,
  JsxParserTextContext,
  type ClientFileParserTextContext,
} from "../../fixtures/parser-context"
import { TemporalWorkspaceFixture } from "../../fixtures/temporal-workspace"

function testParsers(
  contexts: ClientFileParserTextContext[],
  title: string,
  testFn: (parser: ClientFileParserTextContext) => void | Promise<void>
) {
  for (const ctx of contexts) {
    test(`${ctx.parserName}: ${title}`, async () => {
      await testFn(ctx)
    })
  }
}

suite("Client File Parsers", () => {
  const workspace = new TemporalWorkspaceFixture()
  const jsContexts = [new JsxParserTextContext()]
  const allContexts = [new JsxParserTextContext(), new HtmlParserTextContext()]

  teardown(async () => {
    await workspace.teardown()
  })

  testParsers(allContexts, "does not match class name in casual text", async (ctx) => {
    const file = await workspace.createFile(
      `index.${ctx.extension}`,
      "<p>A paragraph that has the text button which is casually the same name of a class</p>"
    )

    const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

    assert(usages.length === 0, "Should not detect class name in casual text")
  })

  testParsers(allContexts, "detects multiple classes in a single attribute", async (ctx) => {
    const file = await workspace.createFile(
      `multiple-classes.${ctx.extension}`,
      `<div ${ctx.classNameAttribute}="class-one class-two"></div>`
    )

    const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

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

  testParsers(
    allContexts,
    "detects the same class used multiple times in a single attribute",
    async (ctx) => {
      const file = await workspace.createFile(
        `duplicate-classes.${ctx.extension}`,
        `<div ${ctx.classNameAttribute}="duplicate-class duplicate-class"></div>`
      )

      const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

      const classUsages = usages.filter((u) => u.name === "duplicate-class")
      assert(
        classUsages.length === 2,
        `Expected 2 usages for 'duplicate-class', found ${classUsages.length}`
      )
    }
  )

  testParsers(jsContexts, "supports classes inside template strings", async (ctx) => {
    const file = await workspace.createFile(
      `with-template-strings.${ctx.extension}`,
      `<div ${ctx.classNameAttribute}={\`my-class\`} />`
    )

    const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

    const classUsages = usages.filter((u) => u.name === "my-class")
    assert(classUsages.length === 1, `Expected 1 usage, found ${classUsages.length}`)
  })

  testParsers(
    jsContexts,
    "supports classes inside template strings with expressions",
    async (ctx) => {
      const file = await workspace.createFile(
        `with-template-expressions.${ctx.extension}`,
        `<div ${ctx.classNameAttribute}={\`my-class \${variable} another-class \`} />`
      )

      const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

      const myClassUsages = usages.filter((u) => u.name === "my-class")
      assert(myClassUsages.length === 1, `Expected 1 usage, found ${myClassUsages.length}`)

      const anotherClassUsages = usages.filter((u) => u.name === "another-class")
      assert(
        anotherClassUsages.length === 1,
        `Expected 1 usage, found ${anotherClassUsages.length}`
      )
    }
  )

  testParsers(allContexts, "doesn't cache the result of parsing a file", async (ctx) => {
    const file = await workspace.createFile(
      `caching.${ctx.extension}`,
      `<div ${ctx.classNameAttribute}="cached-class"></div>`
    )
    const parser = ctx.createParser()

    parser.parseUsagesFrom(file.fsPath)
    await workspace.createFile(
      `caching.${ctx.extension}`,
      `<div ${ctx.classNameAttribute}="cached-class modified-class"></div>`
    )

    const usages = parser.parseUsagesFrom(file.fsPath)
    assert(
      usages.length === 2,
      "Should not cache the result of parsing a file, should detect both classes"
    )
  })
})
