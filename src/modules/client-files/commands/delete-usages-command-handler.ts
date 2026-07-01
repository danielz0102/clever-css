import type { CssClassRepository } from "../../../domain/css-class-repository"

export class DeleteUsages {
  constructor(private classes: CssClassRepository) {}

  async execute(_uri: string): Promise<void> {
    throw new Error("Not implemented yet.")
  }
}
