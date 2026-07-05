import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { Token } from "../../dtos/token-dto"

export class LoadAllUsages {
  constructor(
    private classes: CssClassRepository,
    private getAllUsages: () => Promise<Token[]>
  ) {}

  async execute(): Promise<void> {
    await this.classes.resetAllUsages()
    await this.saveUsages(await this.getAllUsages())
  }

  private async saveUsages(usages: Token[]): Promise<void> {
    for (const { name, location } of usages) {
      const cssClass = await this.classes.findOne(name)
      if (!cssClass) continue

      cssClass.usages.add(location)
      await this.classes.save(cssClass)
    }
  }
}
