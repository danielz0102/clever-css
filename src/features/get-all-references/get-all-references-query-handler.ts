import type { Location } from "../../domain/location"
import type { CssClassIndex } from "../../persistence/css-class-index"

export class GetAllReferences {
  constructor(private index: CssClassIndex) {}

  execute(className: string): Location[] {
    const cssClass = this.index.get(className)
    if (!cssClass) {
      return []
    }

    return [...cssClass.definitions, ...cssClass.usages]
  }
}
