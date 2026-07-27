import type { CssClassRepository } from "../../adapters/css-class-repository"
import {
  type CssClassIndex,
  type CssClassModel,
  fromDomain,
} from "../../persistence/css-class-index"

export class GetUnusedClasses {
  constructor(private index: CssClassIndex) {}

  execute(): CssClassModel[] {
    return Array.from(this.index.values()).filter(GetUnusedClasses.filter)
  }

  static filter = (cls: CssClassModel) => cls.definitions.length > 0 && cls.usages.length === 0
}

export class ClassAnalyzer {
  constructor(private classes: CssClassRepository) {}

  getUnused(): CssClassModel[] {
    return this.classes
      .getAll()
      .filter((cls) => cls.isUnused)
      .map(fromDomain)
  }

  getDuplicated(): CssClassModel[] {
    return this.classes
      .getAll()
      .filter((cls) => cls.isDuplicated)
      .map(fromDomain)
  }
}
