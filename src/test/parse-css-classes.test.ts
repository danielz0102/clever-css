import assert from "node:assert"

import { parseCSSClasses } from "../parse-css-classes"

suite("parseCSSClasses", () => {
  test("returns classes found", async () => {
    const classes = await parseCSSClasses(`
      .class1 {
        color: red;
      }
      .class2 {
        color: blue;
      }
    `)

    assert(classes.length === 2)
    assert(classes[0]?.name === "class1")
    assert(classes[1]?.name === "class2")
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

    assert(classes.length === 0)
  })
})
