import type { CssClassIndex } from "../../../persistence/class-index"
import type { ClientFileFinder } from "../adapters/client-file-finder/client-file-finder"
import type { ClientFileParser } from "../adapters/parsers/client-file-parser"

export class LoadUsages {
  constructor(
    private index: CssClassIndex,
    private parser: ClientFileParser,
    private clientFiles: ClientFileFinder
  ) {}

  async execute(): Promise<void> {
    this.clearUsages()

    const files = await this.clientFiles.find()

    for (const filePath of files) {
      const usages = this.parser.getUsagesFrom(filePath)

      for (const { name, start, end } of usages) {
        const record = this.index.get(name)
        if (record) {
          record.usages.push({ uri: filePath, start, end })
        }
      }
    }
  }

  private clearUsages() {
    for (const record of this.index.values()) {
      record.usages = []
    }
  }
}
