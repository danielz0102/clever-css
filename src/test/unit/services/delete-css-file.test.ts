import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { DeleteDefinitions } from "../../../features/delete-definitions/delete-definitions-command-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"

suite("DeleteDefinitions", () => {
  test("removes all the definitions of a file", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///test.css" }, { uri: "file:///other.css" }],
      })
    )
    await repo.save(
      CssClassMother({
        className: "another-class",
        definitions: [{ uri: "file:///test.css" }],
      })
    )

    const command = new DeleteDefinitions(repo)
    await command.execute("file:///test.css")

    const anotherClass = await repo.findOne("another-class")
    assert(anotherClass === undefined, "Expected 'another-class' to be removed")

    const myClass = await repo.findOne("my-class")
    assert(myClass !== undefined, "Expected 'my-class' to remain in the index")
    assert(
      myClass.definitions.length === 1,
      `Expected 1 remaining definition, got ${myClass.definitions.length}`
    )
  })

  test("removes classes from the index if they have no definitions left", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({ className: "my-class", definitions: [{ uri: "file:///test.css" }] })
    )

    const command = new DeleteDefinitions(repo)
    await command.execute("file:///test.css")

    const myClass = await repo.findOne("my-class")
    assert(myClass === undefined, "Expected the class to be removed from the index")
  })
})
