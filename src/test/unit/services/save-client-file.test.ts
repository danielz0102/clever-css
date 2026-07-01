import assert from "node:assert"

import { CssClassIndex } from "../../../adapters/css-class-index"
import type { ClientFileParser } from "../../../modules/client-files/adapters/parsers/client-file-parser"
import { SaveClientFile } from "../../../modules/client-files/commands/save-client-file"
import type { IndexMap } from "../../../persistence/class-index"

suite("SaveClientFile", () => {
  test("loads all usages found", async () => {
    const index: IndexMap = new Map([
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
          usages: [
            {
              uri: "file:///load-trigger.tsx",
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
          ],
        },
      ],
      [
        "other-class",
        {
          className: "other-class",
          definitions: [
            { uri: "file:///test.css", start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
          ],
          usages: [
            {
              uri: "file:///load-trigger.tsx",
              start: { line: 0, column: 0 },
              end: { line: 0, column: 0 },
            },
          ],
        },
      ],
    ])

    const mockParser: ClientFileParser = {
      getUsagesFrom: () => [
        { name: "my-class", start: { line: 0, column: 13 }, end: { line: 0, column: 21 } },
        { name: "other-class", start: { line: 0, column: 22 }, end: { line: 0, column: 33 } },
      ],
    }

    const saveClientFile = new SaveClientFile(new CssClassIndex(index), mockParser)
    const uri = "/component.tsx"

    await saveClientFile.execute(uri)

    const myClassUsages = index.get("my-class")!.usages
    const otherClassUsages = index.get("other-class")!.usages
    assert(
      myClassUsages.length === 2,
      `Expected 2 usages for 'my-class', got ${myClassUsages.length}`
    )
    assert(
      otherClassUsages.length === 2,
      `Expected 2 usages for 'other-class', got ${otherClassUsages.length}`
    )
  })
})
