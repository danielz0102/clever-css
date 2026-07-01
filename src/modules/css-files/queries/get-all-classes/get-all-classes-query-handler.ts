import type { IndexMap, CssClassModel } from "../../../../persistence/class-index"

export class GetAllClasses {
  constructor(private index: IndexMap) {}

  async execute(): Promise<CssClassModel[]> {
    return Array.from(this.index.values())
  }
}
