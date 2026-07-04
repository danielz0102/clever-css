import type { CssClassRepository } from "../../adapters/css-class-repository"

export class DeleteUsages {
  constructor(private classes: CssClassRepository) {}

  async from(_uri: string): Promise<void> {
    throw new Error("Not implemented yet.")
  }
}
