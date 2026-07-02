import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import type { Token } from "../../../dtos/token-dto"
import { UpdateDefinitions } from "../../../features/update-definitions/update-definitions-command-handler"
import { CssClassMother, makeLocationFrom } from "../../fixtures/mothers/css-class-mother"

function makeToken({ className, uri }: { className: string; uri: string }): Token {
  return {
    name: className,
    location: makeLocationFrom(uri),
  }
}

suite("UpdateDefinitions", () => {
  test("adds new classes found in the file", async () => {
    const repo = new CssClassRepository(new Map())
    const command = new UpdateDefinitions(repo, async (file) => [
      makeToken({ className: "my-class", uri: file.uri }),
    ])

    await command.execute({ uri: "file:///test.css", content: ".my-class { color: red; }" })

    const myClass = await repo.findOne("my-class")
    assert(myClass !== undefined, "Expected 'my-class' to be added to the index")
    assert(
      myClass.definitions.length === 1,
      `Expected 1 definition, got ${myClass.definitions.length}`
    )
  })

  test("adds new definitions of an existing class", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({ className: "my-class", definitions: [{ uri: "file:///test.css" }] })
    )
    const command = new UpdateDefinitions(repo, async (file) => [
      makeToken({ className: "my-class", uri: file.uri }),
    ])

    await command.execute({ uri: "file:///other.css", content: ".my-class { color: blue; }" })

    const myClass = await repo.findOne("my-class")
    assert(myClass !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      myClass.definitions.length === 2,
      `Expected 2 definitions, got ${myClass.definitions.length}`
    )

    const def = myClass.definitions.getAll().find((d) => d.uri === "file:///other.css")
    assert(def !== undefined, "Expected definition in 'file:///other.css' to remain")
  })

  test("removes definitions deleted from the file", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///test.css" }, { uri: "file:///other.css" }],
      })
    )
    const command = new UpdateDefinitions(repo, async () => [])

    await command.execute({ uri: "file:///test.css", content: "" })

    const record = await repo.findOne("my-class")
    assert(record !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      record.definitions.length === 1,
      `Expected 1 remaining definition, got ${record.definitions.length}`
    )
  })

  test("removes classes with no definitions left", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///test.css" }],
      })
    )
    const command = new UpdateDefinitions(repo, async () => [])

    await command.execute({ uri: "file:///test.css", content: "" })

    const myClass = await repo.findOne("my-class")
    assert(myClass === undefined, "Expected 'my-class' to be removed from the index")
  })
})
