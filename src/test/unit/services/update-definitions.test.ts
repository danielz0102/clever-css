import assert from "node:assert"

import { CssClassIndex } from "../../../adapters/css-class-index"
import type { CssClassSymbol } from "../../../modules/css-files/adapters/css-parser"
import { UpdateDefinitions } from "../../../modules/css-files/commands/update-definitions/update-definitions-command-handler"
import type { IndexMap, LocationModel } from "../../../persistence/class-index"

suite("UpdateDefinitions", () => {
  const TEST_URI = "file:///test.css"
  const OTHER_URI = "file:///other.css"

  function makeLocation(uri: string, line: number, column: number): LocationModel {
    return {
      uri,
      start: { line, column },
      end: { line, column: column + 8 },
    }
  }

  function makeSymbol(className: string, line: number, column: number): CssClassSymbol {
    return {
      className,
      location: {
        start: { line, column },
        end: { line, column: column + className.length + 1 },
      },
    }
  }

  test("adds new classes found in the file", async () => {
    const index: IndexMap = new Map()
    const command = new UpdateDefinitions(new CssClassIndex(index), async () => [
      makeSymbol("my-class", 1, 0),
    ])

    await command.execute({ uri: TEST_URI, content: ".my-class { color: red; }" })

    const record = index.get("my-class")
    assert(record !== undefined, "Expected 'my-class' to be added to the index")
    assert(
      record.definitions.length === 1,
      `Expected 1 definition, got ${record.definitions.length}`
    )
    assert(record.definitions[0]?.uri === TEST_URI)
  })

  test("adds new definitions of an existing class", async () => {
    const index: IndexMap = new Map([
      [
        "my-class",
        {
          className: "my-class",
          definitions: [makeLocation(OTHER_URI, 1, 0)],
          usages: [],
        },
      ],
    ])
    const command = new UpdateDefinitions(new CssClassIndex(index), async () => [
      makeSymbol("my-class", 2, 0),
    ])

    await command.execute({ uri: TEST_URI, content: ".my-class { color: blue; }" })

    const record = index.get("my-class")
    assert(record !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      record.definitions.length === 2,
      `Expected 2 definitions, got ${record.definitions.length}`
    )
    assert(record.definitions.some((d) => d.uri === TEST_URI))
    assert(record.definitions.some((d) => d.uri === OTHER_URI))
  })

  test("removes definitions deleted from the file", async () => {
    const index: IndexMap = new Map([
      [
        "my-class",
        {
          className: "my-class",
          definitions: [makeLocation(TEST_URI, 1, 0), makeLocation(OTHER_URI, 1, 0)],
          usages: [],
        },
      ],
    ])
    const command = new UpdateDefinitions(new CssClassIndex(index), async () => [])

    await command.execute({ uri: TEST_URI, content: "" })

    const record = index.get("my-class")
    assert(record !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      record.definitions.length === 1,
      `Expected 1 remaining definition, got ${record.definitions.length}`
    )
    assert(record.definitions[0]?.uri === OTHER_URI)
  })

  test("removes classes with no definitions left", async () => {
    const index: IndexMap = new Map([
      [
        "my-class",
        {
          className: "my-class",
          definitions: [makeLocation(TEST_URI, 1, 0)],
          usages: [],
        },
      ],
    ])
    const command = new UpdateDefinitions(new CssClassIndex(index), async () => [])

    await command.execute({ uri: TEST_URI, content: "" })

    assert(index.get("my-class") === undefined, "Expected 'my-class' to be removed from the index")
  })
})
