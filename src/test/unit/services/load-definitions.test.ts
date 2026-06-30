import assert from "node:assert"

import type { CssClassSymbol } from "../../../modules/css-files/adapters/css-parser"
import { LoadDefinitions } from "../../../modules/css-files/commands/load-definitions/load-definitions-command-handler"
import type {
  CssClassIndex,
  CssClassRecord,
  EditorLocation,
} from "../../../persistence/class-index"

suite("LoadDefinitions", () => {
  const FILE_A = "file:///a.css"
  const FILE_B = "file:///b.css"

  function makeLocation(uri: string, line: number, column: number): EditorLocation {
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

  function makeRecord(className: string): CssClassRecord {
    return {
      className,
      definitions: [makeLocation(FILE_A, 0, 0)],
      usages: [
        { uri: "file:///client.tsx", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
      ],
    }
  }

  test("loads all classes with their definitions", async () => {
    const index: CssClassIndex = new Map()

    const findCssFiles = async () => [
      { uri: FILE_A, content: ".foo { color: red; }" },
      { uri: FILE_B, content: ".bar { color: blue; }" },
    ]
    const parseSymbols = async (content: string) => {
      if (content.includes("foo")) return [makeSymbol("foo", 1, 0)]
      if (content.includes("bar")) return [makeSymbol("bar", 2, 0)]
      return []
    }

    const command = new LoadDefinitions(index, findCssFiles, parseSymbols)
    await command.execute()

    const foo = index.get("foo")
    assert(foo !== undefined, "Expected 'foo' to be in the index")
    assert(
      foo.definitions.length === 1,
      `Expected 'foo' to have 1 definition, got ${foo.definitions.length}`
    )
    assert(foo.definitions[0]?.uri === FILE_A)

    const bar = index.get("bar")
    assert(bar !== undefined, "Expected 'bar' to be in the index")
    assert(
      bar.definitions.length === 1,
      `Expected 'bar' to have 1 definition, got ${bar.definitions.length}`
    )
    assert(bar.definitions[0]?.uri === FILE_B)
  })

  test("empty the index if there are no classes (this should fail)", async () => {
    const index: CssClassIndex = new Map([
      ["foo", makeRecord("foo")],
      ["bar", makeRecord("bar")],
    ])

    const findCssFiles = async () => []
    const parseSymbols = async (_content: string) => []

    const command = new LoadDefinitions(index, findCssFiles, parseSymbols)
    await command.execute()

    assert(index.size === 0, "Expected index to be empty when no CSS files found")
  })

  test("doesn't load usages", async () => {
    const index: CssClassIndex = new Map()

    const findCssFiles = async () => [{ uri: FILE_A, content: ".foo { color: red; }" }]
    const parseSymbols = async (_content: string) => [makeSymbol("foo", 1, 0)]

    const command = new LoadDefinitions(index, findCssFiles, parseSymbols)
    await command.execute()

    const foo = index.get("foo")
    assert(foo !== undefined)
    assert(foo.usages.length === 0, "Expected usages to be empty")
  })
})
