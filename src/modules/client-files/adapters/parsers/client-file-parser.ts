export type Position = {
  line: number
  column: number
}

export type Usage = {
  name: string
  start: Position
  end: Position
}

export interface ClientFileParser {
  getUsagesFrom(path: string): Usage[]
}
