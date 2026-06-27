import type { CssClassIndex, EditorLocation } from "../../../../persistence/class-index"

export class GetUsages {
  constructor(private index: CssClassIndex) {}

  async execute(className: string): Promise<EditorLocation[]> {
    return this.index.get(className)?.usages ?? []
  }
}
