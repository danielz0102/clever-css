import type { CssClass } from "./css-class"

export interface CssClassRepository {
  findOne(className: string): Promise<CssClass | undefined>
  getFromDefinitionUri(uri: string): Promise<CssClass[]>
  getFromUsageUri(uri: string): Promise<CssClass[]>
  save(cssClass: CssClass): Promise<void>
  delete(cssClass: CssClass): Promise<void>
  resetAllUsages(): Promise<void>
  destroy(): Promise<void>
}
