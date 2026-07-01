import assert from "node:assert"

import { CssClassIndex } from "../../../adapters/css-class-index"
import type { ClientFilesFinder } from "../../../features/load-all-usages/find-client-files-adapter"
import { LoadAllUsages } from "../../../features/load-all-usages/load-all-usages-command-handler"
import type { ClientFileParser } from "../../../modules/client-files/adapters/parsers/client-file-parser"
import type { IndexMap, CssClassModel } from "../../../persistence/index-map"

suite("LoadUsages", () => {
  test("loads usages for all classes in the repository", async () => {
    const index: IndexMap = new Map([["my-class", makeRecord("my-class")]])

    const mockParser: ClientFileParser = {
      getUsagesFrom: () => [
        { name: "my-class", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
    }
    const findFiles: ClientFilesFinder = async () => ["/file1.tsx", "/file2.tsx"]

    const loadUsages = new LoadAllUsages(new CssClassIndex(index), mockParser, findFiles)
    await loadUsages.execute()

    const record = index.get("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 2, `Expected 2 usages, found ${record.usages.length}`)
  })

  test("does not load usages for classes that are not used", async () => {
    const index: IndexMap = new Map([["unused-class", makeRecord("unused-class")]])

    const mockParser: ClientFileParser = {
      getUsagesFrom: () => [
        { name: "some-other-class", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
    }
    const findFiles: ClientFilesFinder = async () => ["/file1.tsx", "/file2.tsx"]

    const loadUsages = new LoadAllUsages(new CssClassIndex(index), mockParser, findFiles)
    await loadUsages.execute()

    const record = index.get("unused-class")
    assert(record !== undefined)
    assert(record.usages.length === 0, `Expected 0 usages, found ${record.usages.length}`)
  })

  test("set usages to 0 if there are no usages", async () => {
    const index: IndexMap = new Map([["my-class", makeRecord("my-class")]])
    index.get("my-class")!.usages.push({
      uri: "file:///ex-client.tsx",
      start: { line: 0, column: 0 },
      end: { line: 0, column: 8 },
    })

    const mockParser: ClientFileParser = {
      getUsagesFrom: () => [],
    }
    const findFiles: ClientFilesFinder = async () => ["/file1.tsx", "/file2.tsx"]

    const loadUsages = new LoadAllUsages(new CssClassIndex(index), mockParser, findFiles)
    await loadUsages.execute()

    const record = index.get("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 0, `Expected 0 usages, found ${record.usages.length}`)
  })
})

function makeRecord(className: string): CssClassModel {
  return {
    className,
    definitions: [
      { uri: "file:///test.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
    ],
    usages: [],
  }
}
