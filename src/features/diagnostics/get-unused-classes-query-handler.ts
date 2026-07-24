import type { CssClassModel, CssClassIndex } from "../../persistence/css-class-index"

export class GetUnusedClasses {
  constructor(private index: CssClassIndex) {}

  execute(): CssClassModel[] {
    return Array.from(this.index.values()).filter(GetUnusedClasses.filter)
  }

  static filter = (cls: CssClassModel) => cls.definitions.length > 0 && cls.usages.length === 0
}
