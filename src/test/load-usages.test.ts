import assert from "node:assert"

import type { ClientFilesFinder } from "../modules/client-files/adapters/find-client-files"
import type { ClientFileParser } from "../modules/client-files/adapters/parsers/client-file-parser"
import { LoadUsages } from "../modules/client-files/commands/load-usages"
import type { CssClassIndex, CssClassRecord } from "../persistence/class-index"

suite("LoadUsages", () => {
  test("loads usages for all classes in the repository", async () => {
    const index: CssClassIndex = new Map([["my-class", makeRecord("my-class")]])

    const mockParser: ClientFileParser = {
      getUsagesFrom: () => [
        { name: "my-class", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
    }
    const findFiles: ClientFilesFinder = async () => ["/file1.tsx", "/file2.tsx"]

    const loadUsages = new LoadUsages(index, mockParser, findFiles)
    await loadUsages.execute()

    const record = index.get("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 2, `Expected 2 usages, found ${record.usages.length}`)
  })

  test("does not load usages for classes that are not used", async () => {
    const index: CssClassIndex = new Map()
    index.set("unused-class", makeRecord("unused-class"))

    const mockParser: ClientFileParser = {
      getUsagesFrom: () => [
        { name: "some-other-class", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
    }
    const findFiles: ClientFilesFinder = async () => ["/file1.tsx", "/file2.tsx"]

    const loadUsages = new LoadUsages(index, mockParser, findFiles)
    await loadUsages.execute()

    const record = index.get("unused-class")
    assert(record !== undefined)
    assert(record.usages.length === 0, `Expected 0 usages, found ${record.usages.length}`)
  })
})

function makeRecord(className: string): CssClassRecord {
  return {
    className,
    definitions: [
      { uri: "file:///test.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
    ],
    usages: [],
  }
}
