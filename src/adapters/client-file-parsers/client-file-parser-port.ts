import type { Symbol } from "../../dtos/symbol-dto"

export interface ClientFileParser {
  getUsagesFrom(uri: string): Symbol[]
}
