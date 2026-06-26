export type Usage = {
  name: string
  start: number
  end: number
}

export interface ClientFileParser {
  getUsagesFrom(path: string): Usage[]
}
