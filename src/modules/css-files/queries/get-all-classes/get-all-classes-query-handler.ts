import type { CSSClassIndex, CSSClassRecord } from "../../../../persistence/class-index"

export class GetAllClasses {
  constructor(private index: CSSClassIndex) {}

  async execute(): Promise<CSSClassRecord[]> {
    return Array.from(this.index.values())
  }
}
