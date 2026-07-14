import type { Location } from "../../domain/location"
import type { CssClassIndex } from "../../persistence/css-class-index"

export class GetDefinition {
  constructor(private readonly classes: CssClassIndex) {}

  async execute(className: string): Promise<Location | undefined> {
    return this.classes.get(className)?.definitions[0]
  }
}
