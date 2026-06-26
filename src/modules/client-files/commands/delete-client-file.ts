import type { CssClassIndex } from "../../../persistence/class-index"

export class DeleteClientFile {
  constructor(private _index: CssClassIndex) {}

  async execute(_uri: string): Promise<void> {
    throw new Error("Not implemented yet.")
  }
}
