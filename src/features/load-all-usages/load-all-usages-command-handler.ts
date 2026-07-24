import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { Token } from "../../dtos/token-dto"

export class LoadAllUsages {
  constructor(
    private classes: CssClassRepository,
    private getAllUsages: () => Promise<Token[]>
  ) {}

  async execute(): Promise<void> {
    this.classes.resetAllUsages()
    this.saveUsages(await this.getAllUsages())
  }

  private saveUsages(usages: Token[]): void {
    for (const { name, location } of usages) {
      const cssClass = this.classes.findOne(name)
      if (!cssClass) continue

      cssClass.usages.add(location)
      this.classes.save(cssClass)
    }
  }
}
