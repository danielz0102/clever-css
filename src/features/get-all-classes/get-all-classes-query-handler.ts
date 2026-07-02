import type { CssClassModel, CssClassIndex } from "../../persistence/css-class-index"

export class GetAllClasses {
  constructor(private index: CssClassIndex) {}

  async execute(): Promise<CssClassModel[]> {
    return Array.from(this.index.values())
  }
}
