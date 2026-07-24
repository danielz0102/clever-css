import { GetUnusedClasses } from "../../features/diagnostics/get-unused-classes-query-handler"
import { GetAllClasses } from "../../features/get-all-classes/get-all-classes-query-handler"
import type { CssClassIndex } from "../../persistence/css-class-index"
import { ClassTreeDataProvider } from "./class-tree-data-provider"
import { modelsToIndex } from "./files-index"

export class ClassTreeViewContainer {
  private constructor(
    readonly allClassesTree: ClassTreeDataProvider,
    readonly unusedClassesTree: ClassTreeDataProvider
  ) {}

  static async create(index: CssClassIndex): Promise<ClassTreeViewContainer> {
    const getAll = new GetAllClasses(index)
    const getUnusedClasses = new GetUnusedClasses(index)

    const allClassesTree = await ClassTreeDataProvider.create(async () =>
      modelsToIndex(await getAll.execute())
    )
    const unusedClassesTree = await ClassTreeDataProvider.create(async () =>
      modelsToIndex(await getUnusedClasses.execute())
    )

    return new ClassTreeViewContainer(allClassesTree, unusedClassesTree)
  }

  async refreshIndex(): Promise<void> {
    await Promise.all([this.allClassesTree.refresh(), this.unusedClassesTree.refresh()])
  }
}
