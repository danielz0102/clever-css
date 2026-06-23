import type { CSSClassRepository } from "../../../../domain/css-class-repository"
import { findCSSClasses } from "./find-css-classes"
import { LoadUsages } from "./load-usages"

export async function initIndex(): Promise<CSSClassRepository> {
  const classes = await findCSSClasses()
  const loadUsages = new LoadUsages(classes)

  void loadUsages.execute()

  return classes
}
