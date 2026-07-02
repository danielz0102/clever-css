import { CssClassIndex } from "../../../adapters/css-class-index"
import type { Token } from "../../../dtos/token-dto"
import { LoadAllUsages } from "../../../features/load-all-usages/load-all-usages-command-handler"
import type { IndexMap } from "../../../persistence/index-map"

type LoadAllUsagesTestContext = {
  index: IndexMap
  command: LoadAllUsages
}

export class LoadAllUsagesContextBuilder {
  private index: IndexMap = new Map()
  private usages: Token[] = []

  withClasses(classNames: string[]): LoadAllUsagesContextBuilder {
    for (const className of classNames) {
      this.index.set(className, {
        className,
        definitions: [
          { uri: "file:///test.css", start: { line: 0, column: 0 }, end: { line: 0, column: 8 } },
        ],
        usages: [],
      })
    }
    return this
  }

  withInitialUsages(classNames: string[]): LoadAllUsagesContextBuilder {
    for (const className of classNames) {
      const record = this.index.get(className)
      if (record) {
        record.usages.push({
          uri: "file:///old-file.tsx",
          start: { line: 0, column: 0 },
          end: { line: 0, column: className.length + 1 },
        })
      }
    }
    return this
  }

  withUsages(classNames: string[]): LoadAllUsagesContextBuilder {
    classNames.forEach((className, i) => {
      this.usages.push({
        name: className,
        location: {
          uri: "file:///test.tsx",
          start: { line: i, column: 0 },
          end: { line: i, column: className.length + 1 },
        },
      })
    })
    return this
  }

  build(): LoadAllUsagesTestContext {
    const command = new LoadAllUsages(
      new CssClassIndex(this.index),
      {
        getUsagesFrom: () => this.usages,
      },
      async () => ["file:///test.tsx"]
    )
    return { index: this.index, command }
  }
}
