import assert from "node:assert"

import { htmlParserContext, jsxParserContext } from "../../fixtures/parser-context"
import { TemporalWorkspaceFixture } from "../../fixtures/temporal-workspace"

suite("Client File Parsers", () => {
  const workspace = new TemporalWorkspaceFixture()
  const jsContexts = [jsxParserContext]
  const allContexts = [jsxParserContext, htmlParserContext]

  teardown(async () => {
    await workspace.teardown()
  })

  allContexts.forEach((ctx) => {
    suite(ctx.parserName, () => {
      test("detects multiple classes in a single attribute", async () => {
        const file = await workspace.writeFile(
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

      test("detects the same class used multiple times in a single attribute", async () => {
        const file = await workspace.writeFile(
          `duplicate-classes.${ctx.extension}`,
          `<div ${ctx.classNameAttribute}="duplicate-class duplicate-class"></div>`
        )

        const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

        const classUsages = usages.filter((u) => u.name === "duplicate-class")
        assert(
          classUsages.length === 2,
          `Expected 2 usages for 'duplicate-class', found ${classUsages.length}`
        )
      })

      test("detects nested elements with classes", async () => {
        const file = await workspace.writeFile(
          `nested-elements.${ctx.extension}`,
          `<div ${ctx.classNameAttribute}="outer-class"><span ${ctx.classNameAttribute}="inner-class"></span></div>`
        )

        const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

        assert(usages.length === 2, `Expected 2 usages, found ${usages.length}.`)
      })

      test("returns correct positions", async () => {
        const file = await workspace.writeFile(
          `positions.${ctx.extension}`,
          `<div ${ctx.classNameAttribute}="positioned-class"></div>`
        )

        const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

        const positionedClass = usages.find((u) => u.name === "positioned-class")
        assert(positionedClass)

        assert(
          positionedClass.location.start.line === 0,
          `Expected start line 0, found ${positionedClass.location.start.line}`
        )
        assert(
          positionedClass.location.end.line === 0,
          `Expected end line 0, found ${positionedClass.location.end.line}`
        )

        const startColumn = 4 + ctx.classNameAttribute.length + 3
        assert(
          positionedClass.location.start.column === startColumn,
          `Expected start column ${startColumn}, found ${positionedClass.location.start.column}`
        )

        const endColumn = startColumn + "positioned-class".length
        assert(
          positionedClass.location.end.column === endColumn,
          `Expected end column ${endColumn}, found ${positionedClass.location.end.column}`
        )
      })

      test("returns an empty array when there are no classes", async () => {
        const file = await workspace.writeFile(
          `no-classes.${ctx.extension}`,
          `<div><span></span></div>`
        )

        const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

        assert(usages.length === 0, `Expected 0 usages, found ${usages.length}.`)
      })

      test("does not match class name in casual text", async () => {
        const file = await workspace.writeFile(
          `index.${ctx.extension}`,
          "<p>A paragraph that has the text button which is casually the same name of a class</p>"
        )

        const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

        assert(usages.length === 0, `Expected 0 usages, found ${usages.length}`)
      })

      test("does not cache the result of parsing a file", async () => {
        const file = await workspace.writeFile(
          `caching.${ctx.extension}`,
          `<div ${ctx.classNameAttribute}="cached-class"></div>`
        )
        const parser = ctx.createParser()

        parser.parseUsagesFrom(file.fsPath)
        await workspace.writeFile(
          `caching.${ctx.extension}`,
          `<div ${ctx.classNameAttribute}="cached-class modified-class"></div>`
        )

        const usages = parser.parseUsagesFrom(file.fsPath)
        assert(usages.length === 2, `Expected 2 usages, found ${usages.length}.`)
      })
    })
  })

  jsContexts.forEach((ctx) => {
    suite(ctx.parserName, () => {
      test("supports classes inside template strings", async () => {
        const file = await workspace.writeFile(
          `with-template-strings.${ctx.extension}`,
          `<div ${ctx.classNameAttribute}={\`my-class\`} />`
        )

        const usages = ctx.createParser().parseUsagesFrom(file.fsPath)

        const classUsages = usages.filter((u) => u.name === "my-class")
        assert(classUsages.length === 1, `Expected 1 usage, found ${classUsages.length}`)
      })

      test("supports classes inside template strings with expressions", async () => {
        const file = await workspace.writeFile(
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
      })
    })
  })
})
