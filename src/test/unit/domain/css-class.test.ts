import assert from "node:assert"

import { CssClassMother } from "../../fixtures/mothers/css-class-mother"

suite("CssClass", () => {
  suite("isUnused", () => {
    test("returns true when class has definitions but no usages", () => {
      const cls = CssClassMother({
        className: "unused",
        definitions: [{ uri: "file:///styles.css" }],
      })
      assert.strictEqual(cls.isUnused, true)
    })

    test("returns false when class has usages", () => {
      const cls = CssClassMother({
        className: "used",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///app.ts" }],
      })
      assert.strictEqual(cls.isUnused, false)
    })

    test("returns false when class has no definitions", () => {
      const cls = CssClassMother({
        className: "noDef",
      })
      assert.strictEqual(cls.isUnused, false)
    })
  })

  suite("isDuplicated", () => {
    test("returns true when class has more than one definition", () => {
      const cls = CssClassMother({
        className: "duplicated",
        definitions: [{ uri: "file:///styles1.css" }, { uri: "file:///styles2.css" }],
      })
      assert.strictEqual(cls.isDuplicated, true)
    })

    test("returns false when class has one definition", () => {
      const cls = CssClassMother({
        className: "singleDef",
        definitions: [{ uri: "file:///styles.css" }],
      })
      assert.strictEqual(cls.isDuplicated, false)
    })

    test("returns false when class has no definitions", () => {
      const cls = CssClassMother({
        className: "noDef",
      })
      assert.strictEqual(cls.isDuplicated, false)
    })
  })

  suite("exists", () => {
    test("returns true when class has definitions", () => {
      const cls = CssClassMother({
        className: "exists",
        definitions: [{ uri: "file:///styles.css" }],
      })
      assert.strictEqual(cls.exists, true)
    })

    test("returns false when class has no definitions", () => {
      const cls = CssClassMother({
        className: "noDef",
      })
      assert.strictEqual(cls.exists, false)
    })
  })
})
