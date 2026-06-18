import assert from "node:assert"

import * as vscode from "vscode"

import { CSSClassRepository } from "../domain/css-class-repository"
import { FindReferences } from "../use-cases/find-references"
import { TemporalWorkspaceFixture } from "./fixtures/temporal-workspace"

suite("FindReferences", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("returns all usages of a class", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile("component.tsx", `<div className="my-class">`)
    await workspace.createFile("other.tsx", `<span className="my-class">`)

    const findReferences = new FindReferences(repo)
    const result = await findReferences.execute("my-class")

    assert(result.length === 2, "Expected to find 2 usages of 'my-class'")

    await workspace.teardown()
  })

  test.skip("does not match class name in casual text", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "button",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile(
      "index.tsx",
      "<p>A paragraph that has the text button which is casually the same name of a class</p>"
    )

    const findReferences = new FindReferences(repo)
    const result = await findReferences.execute("button")

    assert(result.length === 0, "Should not detect class name in casual text")
  })

  test("returns an empty array if a class doesn't have usages", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    const findReferences = new FindReferences(repo)
    const result = await findReferences.execute("my-class")

    assert(result.length === 0, "Expected to not find any usages")
  })
})
