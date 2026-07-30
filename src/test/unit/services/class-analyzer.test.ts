import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { ClassAnalyzer } from "../../../features/diagnostics/class-analyzer"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"

suite("ClassAnalyzer", () => {
  suite("getUnused", () => {
    test("returns classes with no usages", () => {
      const repo = new CssClassRepository(new Map())
      repo.save(
        CssClassMother({ className: "unused-class", definitions: [{ uri: "file:///test.css" }] })
      )
      repo.save(
        CssClassMother({
          className: "used-class",
          definitions: [{ uri: "file:///test.css" }],
          usages: [{ uri: "file:///test.html" }],
        })
      )
      const analyzer = new ClassAnalyzer(repo)

      const unusedClasses = analyzer.getUnused()

      assert.strictEqual(unusedClasses.length, 1)
      assert.strictEqual(unusedClasses[0]?.className, "unused-class")
    })
  })

  suite("getDuplicated", () => {
    test("returns classes with multiple definitions", () => {
      const repo = new CssClassRepository(new Map())
      repo.save(
        CssClassMother({
          className: "duplicated-class",
          definitions: [{ uri: "file:///test1.css" }, { uri: "file:///test2.css" }],
        })
      )
      repo.save(
        CssClassMother({
          className: "unique-class",
          definitions: [{ uri: "file:///test.css" }],
        })
      )
      const analyzer = new ClassAnalyzer(repo)

      const duplicatedClasses = analyzer.getDuplicated()

      assert.strictEqual(duplicatedClasses.length, 1)
      assert.strictEqual(duplicatedClasses[0]?.className, "duplicated-class")
    })
  })
})
