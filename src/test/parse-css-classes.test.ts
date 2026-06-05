import assert from "node:assert"
import { parseCSSClasses } from "../parse-css-classes"

suite("parseCSSClasses", () => {
  test("returns classes with correct positions", async () => {
    const classes = await parseCSSClasses(`
      .class1 {
        color: red;
      }
      .class2 {
        color: blue;
      }
    `)

    assert.strictEqual(classes.length, 2)
    assert.deepEqual(classes[0]?.start, { line: 2, column: 7 })
    assert.deepEqual(classes[0]?.end, { line: 2, column: 13 })
    assert.deepEqual(classes[1]?.start, { line: 5, column: 7 })
    assert.deepEqual(classes[1]?.end, { line: 5, column: 13 })
  })

  test("returns an empty array if there are no classes", async () => {
    const classes = await parseCSSClasses(`
      #id1 {
        color: red;
      }
      div {
        color: blue;
      }
    `)

    assert.strictEqual(classes.length, 0)
  })
})
