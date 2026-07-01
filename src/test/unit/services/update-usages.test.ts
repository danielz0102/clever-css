import assert from "node:assert"

import type { ClientFileParser } from "../../../adapters/client-file-parsers/client-file-parser-port"
import { CssClassIndex } from "../../../adapters/css-class-index"
import { UpdateUsages } from "../../../features/update-usages/update-usages-command-handler"
import type { IndexMap } from "../../../persistence/index-map"

suite("UpdateUsages", () => {
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
        {
          className: "my-class",
          location: {
            uri: "file:///test.tsx",
            start: { line: 0, column: 13 },
            end: { line: 0, column: 21 },
          },
        },
        {
          className: "other-class",
          location: {
            uri: "file:///test.tsx",
            start: { line: 0, column: 22 },
            end: { line: 0, column: 33 },
          },
        },
      ],
    }

    const update = new UpdateUsages(new CssClassIndex(index), mockParser)
    const uri = "/component.tsx"

    await update.execute(uri)

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
