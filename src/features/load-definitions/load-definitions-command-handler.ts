import type { CssClassIndex } from "../../adapters/css-class-index"
import { type CssClassSymbol } from "../../adapters/css-parser"
import { CssClass } from "../../domain/css-class"

export class LoadDefinitions {
  constructor(
    private classes: CssClassIndex,
    private parseAllSymbols: () => Promise<CssClassSymbol[]>
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
