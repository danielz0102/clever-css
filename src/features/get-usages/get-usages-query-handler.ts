import type { IndexMap, LocationModel } from "../../persistence/index-map"

export class GetUsages {
  constructor(private index: IndexMap) {}

  async execute(className: string): Promise<LocationModel[]> {
    return this.index.get(className)?.usages ?? []
  }
}
