import type { CssClassRepository } from "../../adapters/css-class-repository"

export class DeleteUsages {
  constructor(private classes: CssClassRepository) {}

  async from(uri: string): Promise<void> {
    const classes = await this.classes.getFromUsageUri(uri)

    for (const cssClass of classes) {
      cssClass.usages.removeFromUri(uri)
      await this.classes.save(cssClass)
    }
  }
}
