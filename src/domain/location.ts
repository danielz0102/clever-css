export type Location = {
  uri: string
  start: Position
  end: Position
}

export type Position = {
  line: number
  column: number
}

export class LocationGroup {
  #locations: Location[] = []

  constructor(...locations: Location[]) {
    this.#locations.push(...locations)
  }

  add(...locations: Location[]) {
    this.#locations.push(...locations)
  }

  removeFromUri(uri: string) {
    this.#locations = this.#locations.filter((l) => l.uri !== uri)
  }

  getAll(): Location[] {
    return [...this.#locations]
  }

  get length(): number {
    return this.#locations.length
  }
}
