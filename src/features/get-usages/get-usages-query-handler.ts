import type { Location } from "../../domain/location"
import type { CssClassIndex } from "../../persistence/css-class-index"

export class GetUsages {
  constructor(private index: CssClassIndex) {}

  async execute(className: string): Promise<Location[]> {
    return this.index.get(className)?.usages ?? []
  }
}
