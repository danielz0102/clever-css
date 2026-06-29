import assert from "node:assert"

import * as vscode from "vscode"

import { ClassTreeDataProvider } from "../../../ui/providers/class-tree/class-tree-data-provider"
import type { FilesIndex } from "../../../ui/providers/class-tree/css-file-data"

suite("ClassDataProvider", () => {
  test("loads all CSS files and their classes", async () => {
    const provider = new ClassTreeDataProvider(
      new Map([
        [
          "file:///test.css",
          {
            uri: vscode.Uri.parse("file:///test.css"),
            classes: [
              {
                name: "test-class1",
                range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 12)),
              },
              {
                name: "test-class2",
                range: new vscode.Range(new vscode.Position(1, 0), new vscode.Position(1, 12)),
              },
            ],
          },
        ],
      ])
    )

    const fileItems = provider.getChildren()
    const classItems = provider.getChildren(fileItems[0])

    assert(fileItems.length === 1, "Expected one CSS file")
    assert(classItems.length === 2, `Expected 2 classes, got ${classItems.length}`)
  })

  test("refreshes data when new classes are added", async () => {
    const index: FilesIndex = new Map([
      [
        "file:///test.css",
        {
          uri: vscode.Uri.parse("file:///test.css"),
          classes: [
            {
              name: "test-class1",
              range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 12)),
            },
          ],
        },
      ],
    ])
    const provider = new ClassTreeDataProvider(index)

    const fileItems = provider.getChildren()
    let classItems = provider.getChildren(fileItems[0])

    assert(classItems.length === 1, `Expected 1 class, got ${classItems.length}`)

    index.get("file:///test.css")?.classes.push({
      name: "test-class2",
      range: new vscode.Range(new vscode.Position(1, 0), new vscode.Position(1, 12)),
    })
    provider.refresh(index)

    classItems = provider.getChildren(fileItems[0])

    assert(classItems.length === 2, `Expected 2 classes after refresh, got ${classItems.length}`)
  })
})
