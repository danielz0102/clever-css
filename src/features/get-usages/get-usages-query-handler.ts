import type { Location } from "../../domain/location"
import type { IndexMap } from "../../persistence/index-map"

export class GetUsages {
  constructor(private index: IndexMap) {}

  async execute(className: string): Promise<Location[]> {
    return this.index.get(className)?.usages ?? []
  }
}
