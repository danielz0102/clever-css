import assert from "node:assert"

import * as vscode from "vscode"

import { ClassTreeDataProvider } from "../class-tree/class-tree-data-provider"

suite("ClassDataProvider", () => {
  test("loads all CSS files and their classes", async () => {
    const provider = new ClassTreeDataProvider([
      {
        uri: vscode.Uri.parse("file:///test.css"),
        classes: [
          {
            name: "test-class1",
            range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 12)),
          },
          {
            name: "test-class2",
            range: new vscode.Range(new vscode.Position(4, 0), new vscode.Position(4, 12)),
          },
        ],
      },
    ])

    const fileItems = provider.getChildren()
    const classItems = provider.getChildren(fileItems[0])

    assert(fileItems.length === 1, "Expected one CSS file")
    assert(classItems.length === 2, `Expected 2 classes, got ${classItems.length}`)
  })

  test("refreshes data when new classes are added", async () => {
    const uri = vscode.Uri.parse("file:///test.css")
    const firstClass = {
      name: "test-class1",
      range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 12)),
    }

    const provider = new ClassTreeDataProvider([{ uri, classes: [firstClass] }])

    let fileItems = provider.getChildren()
    let classItems = provider.getChildren(fileItems[0])

    assert(classItems.length === 1, "Expected 1 class")

    provider.refresh([
      {
        uri,
        classes: [
          firstClass,
          {
            name: "test-class2",
            range: new vscode.Range(new vscode.Position(4, 0), new vscode.Position(4, 12)),
          },
        ],
      },
    ])

    classItems = provider.getChildren(fileItems[0])

    assert(classItems.length === 2, "Expected 2 classes after refresh")
  })
})
