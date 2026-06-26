import type { CssClassIndex } from "../../../persistence/class-index"
import type { ClientFileParser } from "../adapters/parsers/client-file-parser"

export class SaveClientFile {
  constructor(
    private index: CssClassIndex,
    private parser: ClientFileParser
  ) {}

  async execute(uri: string): Promise<void> {
    for (const record of this.index.values()) {
      record.usages = record.usages.filter((u) => u.uri !== uri)
    }

    const usages = this.parser.getUsagesFrom(uri)

    usages.forEach(({ name, start, end }) => {
      const record = this.index.get(name)
      if (record) {
        record.usages.push({ uri, start, end })
      }
    })
  }
}
