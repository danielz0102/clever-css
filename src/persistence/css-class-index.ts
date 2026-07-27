import type { CssClass } from "../domain/css-class"
import type { Location } from "../domain/location"

export type CssClassModel = {
  className: string
  definitions: Location[]
  usages: Location[]
}

export const fromDomain = (cls: CssClass): CssClassModel => ({
  className: cls.className,
  definitions: cls.definitions.getAll(),
  usages: cls.usages.getAll(),
})

export const index = new Map<string, CssClassModel>()
export type CssClassIndex = typeof index
