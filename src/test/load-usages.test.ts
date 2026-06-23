import assert from "node:assert"

import * as vscode from "vscode"

import { CSSClassRepository } from "../domain/css-class-repository"
import { LoadUsages } from "../modules/css-files/commands/init-index/load-usages"
import { TemporalWorkspaceFixture } from "./fixtures/temporal-workspace"

suite("LoadUsages", () => {
  const workspace = new TemporalWorkspaceFixture()

  teardown(async () => {
    await workspace.teardown()
  })

  test("loads usages for all classes in the repository", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile("component.tsx", `<div className="my-class" />`)
    await workspace.createFile("other.tsx", `<span className="my-class" />`)

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const cssClass = repo.get("my-class")
    assert(cssClass !== undefined)
    assert(cssClass.usages.length === 2, `Expected 2 usages, found ${cssClass.usages.length}`)
  })

  test("does not load usages for classes that are not used", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "unused-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const cssClass = repo.get("unused-class")
    assert(cssClass !== undefined)
    assert(cssClass.usages.length === 0, `Expected 0 usages, found ${cssClass.usages.length}`)
  })

  test("does not match class name in casual text", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "button",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile(
      "index.tsx",
      "<p>A paragraph that has the text button which is casually the same name of a class</p>"
    )

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const cssClass = repo.get("button")
    assert(cssClass?.usages.length === 0, "Should not detect class name in casual text")
  })

  test("detects multiple classes in a single className attribute", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "class-one",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )
    repo.add(
      "class-two",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile("multiple-classes.tsx", `<div className="class-one class-two" />`)

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const classOne = repo.get("class-one")
    assert(classOne !== undefined)
    assert(
      classOne.usages.length === 1,
      `Expected 1 usage for 'class-one', found ${classOne.usages.length}`
    )

    const classTwo = repo.get("class-two")
    assert(classTwo !== undefined)
    assert(
      classTwo.usages.length === 1,
      `Expected 1 usage for 'class-two', found ${classTwo.usages.length}`
    )
  })

  test("detects the same class used multiple times in a single className attribute", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "duplicate-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile(
      "duplicate-classes.tsx",
      `<div className="duplicate-class duplicate-class" />`
    )

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const cssClass = repo.get("duplicate-class")
    assert(cssClass !== undefined)
    assert(
      cssClass.usages.length === 2,
      `Expected 2 usages for 'duplicate-class', found ${cssClass.usages.length}`
    )
  })

  test("supports classes inside template strings", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile("with-template-strings.tsx", `<div className={\`my-class\`} />`)

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const cssClass = repo.get("my-class")
    assert(cssClass !== undefined)
    assert(cssClass.usages.length === 1, `Expected 1 usage, found ${cssClass.usages.length}`)
  })

  test("supports classes inside template strings with expressions", async () => {
    const repo = new CSSClassRepository()
    repo.add(
      "my-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )
    repo.add(
      "another-class",
      new vscode.Location(vscode.Uri.parse("file:///test.css"), new vscode.Range(0, 0, 0, 8))
    )

    await workspace.createFile(
      "with-template-expressions.tsx",
      `<div className={\`my-class \${variable} another-class \`} />`
    )

    const loadUsages = new LoadUsages(repo)
    await loadUsages.execute()

    const cssClass = repo.get("my-class")
    assert(cssClass !== undefined)
    assert(cssClass.usages.length === 1, `Expected 1 usage, found ${cssClass.usages.length}`)

    const anotherClass = repo.get("another-class")
    assert(anotherClass !== undefined)
    assert(
      anotherClass.usages.length === 1,
      `Expected 1 usage, found ${anotherClass.usages.length}`
    )
  })
})
