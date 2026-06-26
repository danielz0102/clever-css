import type { CssClassIndex } from "../../../../persistence/class-index"

export class DeleteCssFile {
  constructor(private index: CssClassIndex) {}

  async execute(uri: string): Promise<void> {
    Array.from(this.index.entries())
      .filter(([_, record]) => record.definitions.some((def) => def.uri === uri))
      .forEach(([className]) => {
        this.index.delete(className)
      })
  }
}
