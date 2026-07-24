import type { CssClassRepository } from "../../adapters/css-class-repository"

export class DeleteUsages {
  constructor(private classes: CssClassRepository) {}

  from(uri: string): void {
    const classes = this.classes.getFromUsageUri(uri)

    for (const cssClass of classes) {
      cssClass.usages.removeFromUri(uri)
      this.classes.save(cssClass)
    }
  }
}
