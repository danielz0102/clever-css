import type { CssClassRepository } from "../../../../domain/css-class-repository"

export class DeleteDefinitions {
  constructor(private classes: CssClassRepository) {}

  async execute(uri: string): Promise<void> {
    const classes = await this.classes.getFromDefinitionUri(uri)

    for (const cssClass of classes) {
      cssClass.definitions.removeFromUri(uri)

      if (!cssClass.exists) {
        await this.classes.delete(cssClass)
      } else {
        await this.classes.save(cssClass)
      }
    }
  }
}
