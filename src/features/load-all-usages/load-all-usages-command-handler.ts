import { CssClass } from "../../domain/css-class"
import type { CssClassRepository } from "../../domain/css-class-repository"
import type {
  ClientFileParser,
  Usage,
} from "../../modules/client-files/adapters/parsers/client-file-parser"
import type { ClientFilesFinder } from "./find-client-files-adapter"

export class LoadAllUsages {
  constructor(
    private classes: CssClassRepository,
    private parser: ClientFileParser,
    private findFiles: ClientFilesFinder
  ) {}

  async execute(): Promise<void> {
    await this.classes.resetAllUsages()
    const files = await this.findFiles()

    for (const uri of files) {
      await this.saveUsages(this.parser.getUsagesFrom(uri), uri)
    }
  }

  private async saveUsages(usages: Usage[], uri: string): Promise<void> {
    for (const { name, start, end } of usages) {
      const cssClass = (await this.classes.findOne(name)) ?? new CssClass(name)
      cssClass.usages.add({ uri, start, end })
      await this.classes.save(cssClass)
    }
  }
}
