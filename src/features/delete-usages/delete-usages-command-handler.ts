import type { CssClassIndex } from "../../adapters/css-class-index"

export class DeleteUsages {
  constructor(private classes: CssClassIndex) {}

  async execute(_uri: string): Promise<void> {
    throw new Error("Not implemented yet.")
  }
}
