import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { UpdateDefinitions } from "../../../features/update-definitions/update-definitions-command-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"
import { makeToken } from "../../fixtures/mothers/make-token"

suite("UpdateDefinitions", () => {
  test("adds new classes found in the file", async () => {
    const repo = new CssClassRepository(new Map())
    const command = new UpdateDefinitions(repo, async (file) => [
      makeToken({ className: "my-class", uri: file.uri }),
    ])

    await command.from({ uri: "file:///test.css", content: ".my-class { color: red; }" })

    const myClass = repo.findOne("my-class")
    assert(myClass !== undefined, "Expected 'my-class' to be added to the index")
    assert(
      myClass.definitions.length === 1,
      `Expected 1 definition, got ${myClass.definitions.length}`
    )
  })

  test("adds new definitions of an existing class", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(CssClassMother({ className: "my-class", definitions: [{ uri: "file:///test.css" }] }))
    const command = new UpdateDefinitions(repo, async (file) => [
      makeToken({ className: "my-class", uri: file.uri }),
    ])

    await command.from({ uri: "file:///other.css", content: ".my-class { color: blue; }" })

    const myClass = repo.findOne("my-class")
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
    repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///test.css" }, { uri: "file:///other.css" }],
      })
    )
    const command = new UpdateDefinitions(repo, async () => [])

    await command.from({ uri: "file:///test.css", content: "" })

    const record = repo.findOne("my-class")
    assert(record !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      record.definitions.length === 1,
      `Expected 1 remaining definition, got ${record.definitions.length}`
    )
  })

  test("removes classes with no definitions left", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///test.css" }],
      })
    )
    const command = new UpdateDefinitions(repo, async () => [])

    await command.from({ uri: "file:///test.css", content: "" })

    const myClass = repo.findOne("my-class")
    assert(myClass === undefined, "Expected 'my-class' to be removed from the index")
  })

  test("does not not modify unmodifed classes", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///test.css" }],
        usages: [{ uri: "file:///test.html" }],
      })
    )
    const command = new UpdateDefinitions(repo, async () => [
      makeToken({ className: "my-class", uri: "file:///test.css" }),
    ])

    await command.from({ uri: "file:///test.css", content: "" })

    const myClass = repo.findOne("my-class")
    assert(myClass !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      myClass.definitions.length === 1,
      `Expected 1 definition, got ${myClass.definitions.length}`
    )
    assert(myClass.usages.length === 1, `Expected 1 usage, got ${myClass.usages.length}`)
  })
})
