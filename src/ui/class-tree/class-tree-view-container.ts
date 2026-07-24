import { GetUnusedClasses } from "../../features/diagnostics/get-unused-classes-query-handler"
import { GetAllClasses } from "../../features/get-all-classes/get-all-classes-query-handler"
import type { CssClassIndex, CssClassModel } from "../../persistence/css-class-index"
import { ClassTreeDataProvider } from "./class-tree-data-provider"
import { modelsToIndex } from "./files-index"

export class ClassTreeViewContainer {
  private constructor(
    readonly allClassesTree: ClassTreeDataProvider,
    readonly unusedClassesTree: ClassTreeDataProvider,
    private readonly refreshData: () => Promise<{ all: CssClassModel[]; unused: CssClassModel[] }>
  ) {}

  static async create(index: CssClassIndex): Promise<ClassTreeViewContainer> {
    const getAll = new GetAllClasses(index)
    const getUnusedClasses = new GetUnusedClasses(index)

    const allClassesTree = new ClassTreeDataProvider(modelsToIndex(await getAll.execute()))
    const unusedClassesTree = new ClassTreeDataProvider(
      modelsToIndex(await getUnusedClasses.execute())
    )

    return new ClassTreeViewContainer(allClassesTree, unusedClassesTree, async () => {
      const [all, unused] = await Promise.all([getAll.execute(), getUnusedClasses.execute()])
      return { all, unused }
    })
  }

  async refresh(): Promise<void> {
    const { all, unused } = await this.refreshData()
    this.allClassesTree.refresh(modelsToIndex(all))
    this.unusedClassesTree.refresh(modelsToIndex(unused))
  }
}
