import { CssClass } from "../domain/css-class"
import type { CssClassModel, IndexMap } from "../persistence/index-map"

export class CssClassIndex {
  constructor(private index: IndexMap) {}

  async findOne(className: string): Promise<CssClass | undefined> {
    const model = this.index.get(className)
    return model ? this.toDomain(model) : undefined
  }

  async getFromDefinitionUri(uri: string): Promise<CssClass[]> {
    const classes = Array.from(this.index.values())
      .filter((c) => c.definitions.some((d) => d.uri === uri))
      .map((c) => this.toDomain(c))

    return classes
  }

  async getFromUsageUri(uri: string): Promise<CssClass[]> {
    const classes = Array.from(this.index.values())
      .filter((c) => c.usages.some((u) => u.uri === uri))
      .map((c) => this.toDomain(c))

    return classes
  }

  async save(cssClass: CssClass): Promise<void> {
    const model = this.toPersistence(cssClass)
    this.index.set(model.className, model)
  }

  async delete(cssClass: CssClass): Promise<void> {
    this.index.delete(cssClass.className)
  }

  async resetAllUsages(): Promise<void> {
    for (const model of this.index.values()) {
      model.usages = []
    }
  }

  async destroy(): Promise<void> {
    this.index.clear()
  }

  private toDomain(model: CssClassModel): CssClass {
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
