import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { LoadDefinitions } from "../../../features/load-definitions/load-definitions-command-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"
import { makeToken } from "../../fixtures/mothers/make-token"

suite("LoadDefinitions", () => {
  test("loads all classes with their definitions", async () => {
    const repo = new CssClassRepository(new Map())
    const command = new LoadDefinitions(repo, async () => [
      makeToken({ className: "foo", uri: "file:///foo.css" }),
      makeToken({ className: "bar", uri: "file:///bar.css" }),
    ])

    await command.execute()

    const foo = repo.findOne("foo")
    assert(foo !== undefined, "Expected 'foo' to be in the index")
    assert(
      foo.definitions.length === 1,
      `Expected 'foo' to have 1 definition, got ${foo.definitions.length}`
    )

    const bar = repo.findOne("bar")
    assert(bar !== undefined, "Expected 'bar' to be in the index")
    assert(
      bar.definitions.length === 1,
      `Expected 'bar' to have 1 definition, got ${bar.definitions.length}`
    )
  })

  test("removes classes if they're not definitions", async () => {
    const repo = new CssClassRepository(new Map())
    repo.save(CssClassMother({ className: "foo", definitions: [{ uri: "file:///foo.css" }] }))
    repo.save(CssClassMother({ className: "bar", definitions: [{ uri: "file:///bar.css" }] }))
    const command = new LoadDefinitions(repo, async () => [])

    await command.execute()

    const foo = repo.findOne("foo")
    assert(foo === undefined, "Expected 'foo' to be removed from the index")

    const bar = repo.findOne("bar")
    assert(bar === undefined, "Expected 'bar' to be removed from the index")
  })

  test("doesn't load usages", async () => {
    const repo = new CssClassRepository(new Map())
    const command = new LoadDefinitions(repo, async () => [
      makeToken({ className: "foo", uri: "file:///foo.css" }),
      makeToken({ className: "bar", uri: "file:///bar.css" }),
    ])

    await command.execute()

    const foo = repo.findOne("foo")
    assert(foo !== undefined)
    assert(foo.usages.length === 0, "Expected usages to be empty")
  })
})
