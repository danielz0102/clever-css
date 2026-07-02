import type { Token } from "../../dtos/token-dto"

export interface ClientFileParser {
  getUsagesFrom(uri: string): Token[]
}
