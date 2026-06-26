import type { CssClassIndex, CssClassRecord } from "../../../../persistence/class-index"

export class GetAllClasses {
  constructor(private index: CssClassIndex) {}

  async execute(): Promise<CssClassRecord[]> {
    return Array.from(this.index.values())
  }
}
