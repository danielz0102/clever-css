import assert from "node:assert"

import { parseUsagesFrom } from "../../adapters/client-file-parser"

type FileTestContext = {
  extension: string
  classNameAttribute: "class" | "className"
}

suite("parseUsagesFrom", () => {
  suite("HTML files", () => {
    generalTests({
      extension: "html",
      classNameAttribute: "class",
    })
  })

  suite("JSX/TSX files", () => {
    const jsxFileContext: FileTestContext = {
      extension: "tsx",
      classNameAttribute: "className",
    }

    generalTests(jsxFileContext)
    jsTests(jsxFileContext)
  })

  function generalTests(ctx: FileTestContext) {
    test("detects multiple classes in a single attribute", () => {
      const usages = parseUsagesFrom({
        uri: `multiple-classes.${ctx.extension}`,
        content: `<div ${ctx.classNameAttribute}="class-one class-two"></div>`,
      })

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

    test("detects the same class used multiple times in a single attribute", () => {
      const usages = parseUsagesFrom({
        uri: `duplicate-classes.${ctx.extension}`,
        content: `<div ${ctx.classNameAttribute}="duplicate-class duplicate-class"></div>`,
      })

      const classUsages = usages.filter((u) => u.name === "duplicate-class")
      assert(
        classUsages.length === 2,
        `Expected 2 usages for 'duplicate-class', found ${classUsages.length}`
      )
    })

    test("detects nested elements with classes", () => {
      const usages = parseUsagesFrom({
        uri: `nested-elements.${ctx.extension}`,
        content: `<div ${ctx.classNameAttribute}="outer-class">
            <span ${ctx.classNameAttribute}="inner-class"></span>
          </div>`,
      })

      assert(usages.length === 2, `Expected 2 usages, found ${usages.length}.`)
    })

    test("returns correct positions", () => {
      const usages = parseUsagesFrom({
        uri: `positions.${ctx.extension}`,
        content: `<div ${ctx.classNameAttribute}="positioned-class"></div>`,
      })

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

    test("returns an empty array when there are no classes", () => {
      const usages = parseUsagesFrom({
        uri: `no-classes.${ctx.extension}`,
        content: `<div><span></span></div>`,
      })

      assert(usages.length === 0, `Expected 0 usages, found ${usages.length}.`)
    })

    test("does not match class name in casual text", () => {
      const usages = parseUsagesFrom({
        uri: `index.${ctx.extension}`,
        content:
          "<p>A paragraph that has the text button which is casually the same name of a class</p>",
      })

      assert(usages.length === 0, `Expected 0 usages, found ${usages.length}`)
    })

    test("works with self-closing tags", () => {
      const usages = parseUsagesFrom({
        uri: `self-closing.${ctx.extension}`,
        content: `<img ${ctx.classNameAttribute}="self-closing-class" />`,
      })

      const classUsages = usages.filter((u) => u.name === "self-closing-class")
      assert.equal(classUsages.length, 1, `Expected 1 usage, found ${classUsages.length}`)
    })
  }

  function jsTests(ctx: FileTestContext) {
    test("supports classes inside template strings", () => {
      const usages = parseUsagesFrom({
        uri: `with-template-strings.${ctx.extension}`,
        content: `<div ${ctx.classNameAttribute}={\`my-class\`} />`,
      })
      const classUsages = usages.filter((u) => u.name === "my-class")
      assert(classUsages.length === 1, `Expected 1 usage, found ${classUsages.length}`)
    })

    test("supports classes inside template strings with expressions", () => {
      const usages = parseUsagesFrom({
        uri: `with-template-expressions.${ctx.extension}`,
        content: `<div ${ctx.classNameAttribute}={\`my-class \${variable} another-class \`} />`,
      })

      const myClassUsages = usages.filter((u) => u.name === "my-class")
      assert(myClassUsages.length === 1, `Expected 1 usage, found ${myClassUsages.length}`)

      const anotherClassUsages = usages.filter((u) => u.name === "another-class")
      assert(
        anotherClassUsages.length === 1,
        `Expected 1 usage, found ${anotherClassUsages.length}`
      )
    })
  }
})
