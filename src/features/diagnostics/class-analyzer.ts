import type { CssClassRepository } from "../../adapters/css-class-repository"
import { type CssClassModel, fromDomain } from "../../persistence/css-class-index"

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
