import assert from "node:assert"

import { parseCssClassTokens } from "../../../adapters/css-parser"

suite("parseCssClassTokens", () => {
  test("returns all classes of a CSS content", () => {
    const tokens = parseCssClassTokens({
      uri: "file:///test.css",
      content: ".class1 { color: red; } .class2 { color: blue; }",
    })

    assert.strictEqual(tokens.length, 2)
  })

  test("ignores pseudo-classes", () => {
    const tokens = parseCssClassTokens({
      uri: "file:///test.css",
      content: ".class1:hover { color: red; } .class2 { color: blue; }",
    })

    assert.strictEqual(tokens.length, 2)
  })
})
