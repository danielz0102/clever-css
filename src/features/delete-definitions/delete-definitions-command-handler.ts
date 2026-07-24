import type { CssClassRepository } from "../../adapters/css-class-repository"

export class DeleteDefinitions {
  constructor(private classes: CssClassRepository) {}

  from(uri: string): void {
    const classes = this.classes.getFromDefinitionUri(uri)

    for (const cssClass of classes) {
      cssClass.definitions.removeFromUri(uri)

      if (!cssClass.exists) {
        this.classes.delete(cssClass)
      } else {
        this.classes.save(cssClass)
      }
    }
  }
}
