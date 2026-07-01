import type { CssClassIndex } from "../../adapters/css-class-index"

export class DeleteDefinitions {
  constructor(private classes: CssClassIndex) {}

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
