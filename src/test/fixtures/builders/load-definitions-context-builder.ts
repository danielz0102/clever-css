import { CssClassIndex } from "../../../adapters/css-class-index"
import type { Token } from "../../../dtos/token-dto"
import { LoadDefinitions } from "../../../features/load-definitions/load-definitions-command-handler"
import type { IndexMap } from "../../../persistence/index-map"

type LoadDefinitionsTestContext = {
  index: IndexMap
  command: LoadDefinitions
}

export class LoadDefinitionsTestContextBuilder {
  private index: IndexMap = new Map()
  private definitions: Token[] = []

  withClasses(classNames: string[]): LoadDefinitionsTestContextBuilder {
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

  withDefinitions(classNames: string[]): LoadDefinitionsTestContextBuilder {
    classNames.forEach((className, i) => {
      this.definitions.push({
        name: className,
        location: {
          uri: "file:///test.css",
          start: { line: i, column: 0 },
          end: { line: i, column: className.length + 1 },
        },
      })
    })
    return this
  }

  build(): LoadDefinitionsTestContext {
    const command = new LoadDefinitions(new CssClassIndex(this.index), async () => this.definitions)
    return { index: this.index, command }
  }
}
