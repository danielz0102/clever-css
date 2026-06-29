import type { CssClassIndex } from "../../../../persistence/class-index"

export class DeleteCssFile {
  constructor(private index: CssClassIndex) {}

  async execute(uri: string): Promise<void> {
    Array.from(this.index.entries())
      .filter(([_, record]) => record.definitions.some((def) => def.uri === uri))
      .forEach(([className, record]) => {
        record.definitions = record.definitions.filter((def) => def.uri !== uri)

        if (record.definitions.length === 0) {
          this.index.delete(className)
        }
      })
  }
}
