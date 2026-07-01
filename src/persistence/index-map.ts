import type { Location } from "../domain/location"

export type CssClassModel = {
  className: string
  definitions: Location[]
  usages: Location[]
}

export const index = new Map<string, CssClassModel>()
export type IndexMap = typeof index
