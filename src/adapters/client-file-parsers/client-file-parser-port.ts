import type { Location } from "../../domain/location"

export type UsageSymbol = {
  className: string
  location: Location
}

export interface ClientFileParser {
  getUsagesFrom(uri: string): UsageSymbol[]
}
