import { LocationGroup, type Location } from "./location"

export class CssClass {
  readonly definitions = new LocationGroup()
  readonly usages = new LocationGroup()

  constructor(
    readonly className: string,
    ...definitions: Location[]
  ) {
    this.definitions.add(...definitions)
  }

  get exists(): boolean {
    return this.definitions.length > 0
  }
}
