import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { DeleteUsages } from "../../../features/delete-usages/delete-usages-command-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"

suite("DeleteUsages", () => {
  test("removes all usages from the URI", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///page.html" }, { uri: "file:///other.html" }],
      })
    )
    await repo.save(
      CssClassMother({
        className: "another-class",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///page.html" }],
      })
    )

    const command = new DeleteUsages(repo)
    await command.from("file:///page.html")

    const classesFound = await repo.getFromUsageUri("file:///page.html")
    assert(classesFound.length === 0, "Expected no classes to be found for 'file:///page.html'")
  })

  test("does nothing when no classes use the URI", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///page.html" }],
      })
    )

    const command = new DeleteUsages(repo)
    await command.from("file:///nonexistent.html")

    const myClass = await repo.findOne("my-class")
    assert(myClass !== undefined, "Expected 'my-class' to remain in the index")
    assert(myClass.usages.length === 1, `Expected 1 remaining usage, got ${myClass.usages.length}`)
  })
})
