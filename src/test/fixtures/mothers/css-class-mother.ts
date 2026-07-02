import { CssClass } from "../../../domain/css-class"
import type { Position } from "../../../domain/location"

type CssClassOptions = {
  className: string
  definitions?: LocationOptions[]
  usages?: LocationOptions[]
}

type LocationOptions = {
  uri: string
}

export function CssClassMother(options: CssClassOptions) {
  const cssClass = new CssClass(options.className)
  if (options.definitions) {
    cssClass.definitions.add(
      ...options.definitions.map((def) => ({
        uri: def.uri,
        start: DefaultPostion(),
        end: DefaultPostion(),
      }))
    )
  }
  if (options.usages) {
    cssClass.usages.add(
      ...options.usages.map((usage) => ({
        uri: usage.uri,
        start: DefaultPostion(),
        end: DefaultPostion(),
      }))
    )
  }
  return cssClass
}

function DefaultPostion(): Position {
  return { line: 0, column: 0 }
}
