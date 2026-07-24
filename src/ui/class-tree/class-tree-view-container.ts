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

    const refreshData = async () => {
      const all = await getAll.execute()
      const unused = all.filter(GetUnusedClasses.filter)
      return { all, unused }
    }

    const { all, unused } = await refreshData()
    const allClassesTree = new ClassTreeDataProvider(modelsToIndex(all))
    const unusedClassesTree = new ClassTreeDataProvider(modelsToIndex(unused))

    return new ClassTreeViewContainer(allClassesTree, unusedClassesTree, refreshData)
  }

  async refresh(): Promise<void> {
    const { all, unused } = await this.refreshData()
    this.allClassesTree.refresh(modelsToIndex(all))
    this.unusedClassesTree.refresh(modelsToIndex(unused))
  }
}
