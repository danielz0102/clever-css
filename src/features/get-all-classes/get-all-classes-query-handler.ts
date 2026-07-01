import type { CssClassModel, IndexMap } from "../../persistence/index-map"

export class GetAllClasses {
  constructor(private index: IndexMap) {}

  async execute(): Promise<CssClassModel[]> {
    return Array.from(this.index.values())
  }
}
