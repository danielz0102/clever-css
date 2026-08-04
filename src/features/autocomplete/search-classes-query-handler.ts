import { CssClassIndex, CssClassModel } from "../../persistence/css-class-index"

export class SearchClasses {
  constructor(private readonly classes: CssClassIndex) {}

  execute(query: string): CssClassModel[] {
    return Array.from(this.classes.values()).filter((model) => {
      return model.className.includes(query) && model.definitions.length > 0
    })
  }
}
