import { CssClass } from "../domain/css-class"
import type { CssClassModel, CssClassIndex } from "../persistence/css-class-index"

export class CssClassRepository {
  constructor(private index: CssClassIndex) {}

  findOne(className: string): CssClass | undefined {
    const model = this.index.get(className)
    return model ? this.toDomain(model) : undefined
  }

  getAll(): CssClass[] {
    return Array.from(this.index.values()).map(this.toDomain)
  }

  getFromDefinitionUri(uri: string): CssClass[] {
    return Array.from(this.index.values())
      .filter((c) => c.definitions.some((d) => d.uri === uri))
      .map(this.toDomain)
  }

  getFromUsageUri(uri: string): CssClass[] {
    return Array.from(this.index.values())
      .filter((c) => c.usages.some((u) => u.uri === uri))
      .map(this.toDomain)
  }

  save(cssClass: CssClass): void {
    const model = this.toPersistence(cssClass)
    this.index.set(model.className, model)
  }

  delete(cssClass: CssClass): void {
    this.index.delete(cssClass.className)
  }

  resetAllUsages(): void {
    for (const model of this.index.values()) {
      model.usages = []
    }
  }

  destroy(): void {
    this.index.clear()
  }

  private toDomain = (model: CssClassModel): CssClass => {
    const entity = new CssClass(model.className, ...model.definitions)
    entity.usages.add(...model.usages)
    return entity
  }

  private toPersistence(entity: CssClass): CssClassModel {
    return {
      className: entity.className,
      definitions: entity.definitions.getAll(),
      usages: entity.usages.getAll(),
    }
  }
}
