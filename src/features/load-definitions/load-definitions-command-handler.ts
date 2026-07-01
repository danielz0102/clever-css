import type { CssClassIndex } from "../../adapters/css-class-index"
import { CssClass } from "../../domain/css-class"
import type { Symbol } from "../../dtos/symbol-dto"

export class LoadDefinitions {
  constructor(
    private classes: CssClassIndex,
    private parseAllSymbols: () => Promise<Symbol[]>
  ) {}

  async execute(): Promise<void> {
    await this.classes.destroy()

    const symbols = await this.parseAllSymbols()

    for (const { className, location } of symbols) {
      const cssClass = (await this.classes.findOne(className)) ?? new CssClass(className)
      cssClass.definitions.add(location)
      await this.classes.save(cssClass)
    }
  }
}
