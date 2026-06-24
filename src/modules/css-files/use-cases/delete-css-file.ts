import type { CSSClassIndex } from "../../../persistence/class-index"

export class DeleteCSSFile {
  constructor(private index: CSSClassIndex) {}

  async execute(uri: string): Promise<void> {
    Array.from(this.index.entries())
      .filter(([_, record]) => record.definitions.some((def) => def.uri === uri))
      .forEach(([className]) => {
        this.index.delete(className)
      })
  }
}
