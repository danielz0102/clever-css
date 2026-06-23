import assert from "node:assert"

import * as vscode from "vscode"

import { CSSClassRepository } from "../domain/css-class-repository"
import { SaveClientFile } from "../modules/client-files/save-client-file"
import { TemporalWorkspaceFixture } from "./fixtures/temporal-workspace"

suite("SaveClientFile", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("loads all classes found", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )
    repo.add(
      "other-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(1, 0, 1, 8))
    )
    repo
      .get("my-class")!
      .addUsage(
        new vscode.Location(
          vscode.Uri.parse("file:///load-trigger.tsx"),
          new vscode.Range(0, 0, 0, 0)
        )
      )
    repo
      .get("other-class")!
      .addUsage(
        new vscode.Location(
          vscode.Uri.parse("file:///load-trigger.tsx"),
          new vscode.Range(0, 0, 0, 0)
        )
      )

    const uri = await workspace.createFile(
      "component.tsx",
      `<div className="my-class other-class">`
    )

    const saveClientFile = new SaveClientFile(repo)
    await saveClientFile.execute(uri)

    const myClassUsages = repo.get("my-class")!.usages
    const otherClassUsages = repo.get("other-class")!.usages

    assert(
      myClassUsages.length === 2,
      `Expected 2 usages for 'my-class', got ${myClassUsages.length}`
    )
    assert(
      otherClassUsages.length === 2,
      `Expected 2 usages for 'other-class', got ${otherClassUsages.length}`
    )
    assert(
      myClassUsages[1]!.uri.toString() === uri.toString(),
      "Expected the second usage to be in the test file"
    )
    assert(
      otherClassUsages[1]!.uri.toString() === uri.toString(),
      "Expected the second usage to be in the test file"
    )
  })

  test("supports classes inside template strings", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )
    repo
      .get("my-class")!
      .addUsage(
        new vscode.Location(
          vscode.Uri.parse("file:///load-trigger.tsx"),
          new vscode.Range(0, 0, 0, 0)
        )
      )

    const uri = await workspace.createFile("component.tsx", `<div className={\`my-class\`}>`)

    const saveClientFile = new SaveClientFile(repo)
    await saveClientFile.execute(uri)

    assert(
      repo.get("my-class")!.usages.length === 2,
      "Expected the class usage to be loaded from template string"
    )
  })
})
