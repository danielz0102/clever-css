import { LocationGroup, type Location } from "./location"

export class CssClass {
  readonly definitions = new LocationGroup()
  readonly usages = new LocationGroup()

  constructor(
    readonly className: string,
    ...definition: Location[]
  ) {
    this.definitions.add(...definition)
  }

  get exists(): boolean {
    return this.definitions.length > 0
  }
}
