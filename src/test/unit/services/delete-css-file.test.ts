import assert from "node:assert"

import { DeleteCssFile } from "../../../modules/css-files/commands/delete-css-file/delete-css-file-command-handler"
import type { CssClassIndex } from "../../../persistence/class-index"

suite("DeleteCssFile", () => {
  test("removes all the definitions of a file", async () => {
    const testClass = "my-class"
    const index: CssClassIndex = new Map([
      [
        testClass,
        {
          className: testClass,
          definitions: [
            {
              uri: "file:///test.css",
              start: { line: 0, column: 0 },
              end: { line: 0, column: 8 },
            },
            {
              uri: "file:///other.css",
              start: { line: 1, column: 0 },
              end: { line: 1, column: 8 },
            },
          ],
          usages: [],
        },
      ],
      [
        "another-class-that-will-be-removed",
        {
          className: "another-class-that-will-be-removed",
          definitions: [
            {
              uri: "file:///test.css",
              start: { line: 2, column: 0 },
              end: { line: 2, column: 13 },
            },
          ],
          usages: [],
        },
      ],
    ])

    const command = new DeleteCssFile(index)
    await command.execute("file:///test.css")

    assert(index.size === 1, `Expected 1 remaining class, got ${index.size}`)

    const record = index.get(testClass)
    assert(record !== undefined, `Expected '${testClass}' to remain in the index`)
    assert(
      record.definitions.length === 1,
      `Expected 1 remaining definition, got ${record.definitions.length}`
    )
    assert(record.definitions[0]?.uri === "file:///other.css")
  })

  test("removes classes from the index if they have no definitions left", async () => {
    const index: CssClassIndex = new Map([
      [
        "my-class",
        {
          className: "my-class",
          definitions: [
            {
              uri: "file:///test.css",
              start: { line: 0, column: 0 },
              end: { line: 0, column: 8 },
            },
          ],
          usages: [],
        },
      ],
    ])

    const command = new DeleteCssFile(index)
    await command.execute("file:///test.css")

    assert(index.get("my-class") === undefined, "Expected the class to be removed from the index")
  })
})
