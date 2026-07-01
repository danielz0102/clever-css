import assert from "node:assert"

import { LoadAllUsagesContextBuilder } from "../../fixtures/builders/load-all-usages-context-builder"

suite("LoadUsages", () => {
  test("loads usages for all classes in the repository", async () => {
    const { index, command } = new LoadAllUsagesContextBuilder()
      .withClasses(["my-class"])
      .withUsages(["my-class", "my-class"])
      .build()

    await command.execute()

    const myClass = index.get("my-class")
    assert(myClass !== undefined)
    assert(myClass.usages.length === 2, `Expected 2 usages, found ${myClass.usages.length}`)
  })

  test("does not load usages for classes that are not used", async () => {
    const { index, command } = new LoadAllUsagesContextBuilder()
      .withClasses(["unused-class"])
      .withUsages(["some-other-class"])
      .build()

    await command.execute()

    const unusedClass = index.get("unused-class")
    assert(unusedClass !== undefined)
    assert(unusedClass.usages.length === 0, `Expected 0 usages, found ${unusedClass.usages.length}`)
  })

  test("set usages to 0 if there are no usages", async () => {
    const { command, index } = new LoadAllUsagesContextBuilder()
      .withClasses(["my-class"])
      .withInitialUsages(["my-class"])
      .build()

    await command.execute()

    const record = index.get("my-class")
    assert(record !== undefined)
    assert(record.usages.length === 0, `Expected 0 usages, found ${record.usages.length}`)
  })
})
