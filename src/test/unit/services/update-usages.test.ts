import assert from "node:assert"

import { CssClassRepository } from "../../../adapters/css-class-repository"
import { UpdateUsages } from "../../../features/update-usages/update-usages-command-handler"
import { CssClassMother } from "../../fixtures/mothers/css-class-mother"
import { makeToken } from "../../fixtures/mothers/make-token"

suite("UpdateUsages", () => {
  test("loads all usages found", async () => {
    const repo = new CssClassRepository(new Map())
    await repo.save(
      CssClassMother({
        className: "my-class",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///component.tsx" }],
      })
    )
    await repo.save(
      CssClassMother({
        className: "other-class",
        definitions: [{ uri: "file:///styles.css" }],
        usages: [{ uri: "file:///component.tsx" }],
      })
    )
    const update = new UpdateUsages(repo, {
      getUsagesFrom: () => [
        makeToken({ className: "my-class", uri: "file:///component.tsx" }),
        makeToken({ className: "other-class", uri: "file:///component.tsx" }),
      ],
    })

    await update.from("/component.tsx")

    const myClass = await repo.findOne("my-class")
    const otherClass = await repo.findOne("other-class")
    assert(myClass !== undefined, "Expected 'my-class' to remain in the index")
    assert(otherClass !== undefined, "Expected 'other-class' to remain in the index")
    assert(
      myClass.usages.length === 2,
      `Expected 2 usages for 'my-class', got ${myClass.usages.length}`
    )
    assert(
      otherClass.usages.length === 2,
      `Expected 2 usages for 'other-class', got ${otherClass.usages.length}`
    )
  })
})
