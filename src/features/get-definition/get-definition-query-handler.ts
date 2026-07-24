import type { Location } from "../../domain/location"
import type { CssClassIndex } from "../../persistence/css-class-index"

export class GetDefinition {
  constructor(private readonly classes: CssClassIndex) {}

  execute(className: string): Location | undefined {
    return this.classes.get(className)?.definitions[0]
  }
}
