import assert from "node:assert"

import { LoadDefinitionsTestContextBuilder } from "../../fixtures/builders/load-definitions-context-builder"

suite("LoadDefinitions", () => {
  test("loads all classes with their definitions", async () => {
    const { command, index } = new LoadDefinitionsTestContextBuilder()
      .withDefinitions(["foo", "bar"])
      .build()

    await command.execute()

    const foo = index.get("foo")
    assert(foo !== undefined, "Expected 'foo' to be in the index")
    assert(
      foo.definitions.length === 1,
      `Expected 'foo' to have 1 definition, got ${foo.definitions.length}`
    )

    const bar = index.get("bar")
    assert(bar !== undefined, "Expected 'bar' to be in the index")
    assert(
      bar.definitions.length === 1,
      `Expected 'bar' to have 1 definition, got ${bar.definitions.length}`
    )
  })

  test("empty the index if there are no classes", async () => {
    const { command, index } = new LoadDefinitionsTestContextBuilder()
      .withClasses(["foo", "bar"])
      .build()

    await command.execute()

    assert(index.size === 0, "Expected index to be empty when no definitions are found")
  })

  test("doesn't load usages", async () => {
    const { command, index } = new LoadDefinitionsTestContextBuilder()
      .withDefinitions(["foo"])
      .build()

    await command.execute()

    const foo = index.get("foo")
    assert(foo !== undefined)
    assert(foo.usages.length === 0, "Expected usages to be empty")
  })
})
