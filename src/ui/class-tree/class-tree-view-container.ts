import type { CssClassIndex } from "../../persistence/css-class-index"
import { GetAllClasses } from "../../features/get-all-classes/get-all-classes-query-handler"
import { GetUnusedClasses } from "../../features/diagnostics/get-unused-classes-query-handler"
import { ClassTreeDataProvider } from "./class-tree-data-provider"
import { modelsToIndex } from "./files-index"

export class ClassTreeViewContainer {
  readonly allClassesTree: ClassTreeDataProvider
  readonly unusedClassesTree: ClassTreeDataProvider
  private getAll: GetAllClasses
  private getUnusedClasses: GetUnusedClasses

  private constructor(
    allClassesTree: ClassTreeDataProvider,
    unusedClassesTree: ClassTreeDataProvider,
    getAll: GetAllClasses,
    getUnusedClasses: GetUnusedClasses
  ) {
    this.allClassesTree = allClassesTree
    this.unusedClassesTree = unusedClassesTree
    this.getAll = getAll
    this.getUnusedClasses = getUnusedClasses
  }

  static async create(index: CssClassIndex): Promise<ClassTreeViewContainer> {
    const getAll = new GetAllClasses(index)
    const getUnusedClasses = new GetUnusedClasses(index)

    const allClassesTree = await ClassTreeDataProvider.create(async () =>
      modelsToIndex(await getAll.execute())
    )
    const unusedClassesTree = await ClassTreeDataProvider.create(async () =>
      modelsToIndex(await getUnusedClasses.execute())
    )

    return new ClassTreeViewContainer(allClassesTree, unusedClassesTree, getAll, getUnusedClasses)
  }

  async refreshIndex(): Promise<void> {
    await Promise.all([this.allClassesTree.refresh(), this.unusedClassesTree.refresh()])
  }
}
