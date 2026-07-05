import type { Token } from "../../dtos/token-dto"

export interface ClientFileParser {
  parseUsagesFrom(uri: string): Token[]
}
