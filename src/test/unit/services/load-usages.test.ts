import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { LoadAllUsages } from "../../../features/load-all-usages/load-all-usages-command-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"
import { makeToken } from "../../fixtures/mothers/make-token"

suite("LoadUsages", () => {
  test("loads usages for all classes in the repository", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(
      CssClassMother({ className: "my-class", definitions: [{ uri: "file:///styles.css" }] })
    )
    const command = new LoadAllUsages(repo, async () => [
      makeToken({ className: "my-class", uri: "file:///index.html" }),
      makeToken({ className: "my-class", uri: "file:///about.html" }),
    ])

    await command.execute()

    const myClass = repo.findOne("my-class")
    assert(myClass !== undefined)
    assert(myClass.usages.length === 2, `Expected 2 usages, found ${myClass.usages.length}`)
  })

  test("does not load usages for classes that are not used", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(
      CssClassMother({ className: "unused-class", definitions: [{ uri: "file:///styles.css" }] })
    )
    const command = new LoadAllUsages(repo, async () => [
      makeToken({ className: "some-other-class", uri: "file:///index.html" }),
    ])

    await command.execute()

    const unusedClass = repo.findOne("unused-class")
    assert(unusedClass !== undefined)
    assert(unusedClass.usages.length === 0, `Expected 0 usages, found ${unusedClass.usages.length}`)
  })

  test("set usages to 0 if there are no usages", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///index.html" }, { uri: "file:///about.html" }],
      })
    )
    const command = new LoadAllUsages(repo, async () => [])

    await command.execute()

    const record = repo.findOne("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 0, `Expected 0 usages, found ${record.usages.length}`)
  })

  test("does not add a new class if it does not exist in the repository", async () => {
    const repo = new CssClassRepository(new Map())
    const command = new LoadAllUsages(repo, async () => [
      makeToken({ className: "new-class", uri: "file:///index.html" }),
    ])

    await command.execute()

    const cssClass = repo.findOne("new-class")
    assert(cssClass === undefined, `Expected no record, found ${cssClass?.className}`)
  })
})
