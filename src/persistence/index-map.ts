export type LocationModel = {
  uri: string
  start: { line: number; column: number }
  end: { line: number; column: number }
}

export type CssClassModel = {
  className: string
  definitions: LocationModel[]
  usages: LocationModel[]
}

export const index = new Map<string, CssClassModel>()
export type IndexMap = typeof index
