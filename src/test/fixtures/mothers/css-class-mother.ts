import { CssClass } from "../../../domain/css-class"
import type { Location, Position } from "../../../domain/location"
import type { CssClassModel } from "../../../persistence/css-class-index"

type CssClassOptions = {
  className: string
  definitions?: LocationOptions[]
  usages?: LocationOptions[]
}

type LocationOptions = {
  uri: string
}

export function CssClassMother(options: CssClassOptions): CssClass {
  const cssClass = new CssClass(options.className)
  if (options.definitions) {
    cssClass.definitions.add(...options.definitions.map(({ uri }) => makeLocationFrom(uri)))
  }
  if (options.usages) {
    cssClass.usages.add(...options.usages.map(({ uri }) => makeLocationFrom(uri)))
  }
  return cssClass
}

export function CssClassModelMother({
  className,
  definitions = [],
  usages = [],
}: CssClassOptions): CssClassModel {
  return {
    className,
    definitions: definitions.map(({ uri }) => makeLocationFrom(uri)),
    usages: usages.map(({ uri }) => makeLocationFrom(uri)),
  }
}

export function makeLocationFrom(uri: string): Location {
  return {
    uri,
    start: DefaultPostion(),
    end: DefaultPostion(),
  }
}

function DefaultPostion(): Position {
  return { line: 0, column: 0 }
}
