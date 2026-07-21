import assert from "node:assert"

import { GetUnusedClasses } from "../../../features/diagnostics/get-unused-classes-query-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"

suite("GetUnusedClasses", () => {
  test("returns multiple unused classes from different files", async () => {
    const index = new Map()
    index.set("x", CssClassMother({ className: "x", definitions: [{ uri: "file:///x.css" }] }))
    index.set("y", CssClassMother({ className: "y", definitions: [{ uri: "file:///y.css" }] }))
    index.set(
      "z",
      CssClassMother({
        className: "z",
        definitions: [{ uri: "file:///z.css" }],
        usages: [{ uri: "file:///z.ts" }],
      })
    )
    const handler = new GetUnusedClasses(index)

    const result = await handler.execute()

    assert.strictEqual(result.length, 2)
    const names = result.map((r) => r.className).sort()
    assert.deepStrictEqual(names, ["x", "y"])
  })

  test("returns classes with definitions but no usages", async () => {
    const index = new Map()
    index.set(
      "foo",
      CssClassMother({ className: "foo", definitions: [{ uri: "file:///foo.css" }] })
    )
    const handler = new GetUnusedClasses(index)

    const result = await handler.execute()

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0]?.className, "foo")
  })

  test("excludes classes with both definitions and usages", async () => {
    const index = new Map()
    index.set(
      "used",
      CssClassMother({
        className: "used",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///app.ts" }],
      })
    )
    const handler = new GetUnusedClasses(index)

    const result = await handler.execute()

    assert.strictEqual(result.length, 0)
  })

  test("excludes classes with no definitions", async () => {
    const index = new Map()
    index.set("noDef", CssClassMother({ className: "noDef" }))
    const handler = new GetUnusedClasses(index)

    const result = await handler.execute()

    assert.strictEqual(result.length, 0)
  })

  test("returns empty array when all classes are used", async () => {
    const index = new Map()
    index.set(
      "a",
      CssClassMother({
        className: "a",
        definitions: [{ uri: "file:///a.css" }],
        usages: [{ uri: "file:///a.ts" }],
      })
    )
    index.set(
      "b",
      CssClassMother({
        className: "b",
        definitions: [{ uri: "file:///b.css" }],
        usages: [{ uri: "file:///b.ts" }],
      })
    )
    const handler = new GetUnusedClasses(index)

    const result = await handler.execute()

    assert.strictEqual(result.length, 0)
  })
})
