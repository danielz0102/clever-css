import type { CssClassRepository } from "../../adapters/css-class-repository"
import { CssClass } from "../../domain/css-class"
import type { Token } from "../../dtos/token-dto"

export class LoadDefinitions {
  constructor(
    private classes: CssClassRepository,
    private parseAllSymbols: () => Promise<Token[]>
  ) {}

  async execute(): Promise<void> {
    await this.classes.destroy()

    const symbols = await this.parseAllSymbols()

    for (const { name: className, location } of symbols) {
      const cssClass = (await this.classes.findOne(className)) ?? new CssClass(className)
      cssClass.definitions.add(location)
      await this.classes.save(cssClass)
    }
  }
}
