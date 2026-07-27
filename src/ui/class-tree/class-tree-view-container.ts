import { CssClassRepository } from "../../adapters/css-class-repository"
import { ClassAnalyzer } from "../../features/diagnostics/class-analyzer"
import { GetAllClasses } from "../../features/get-all-classes/get-all-classes-query-handler"
import type { CssClassIndex, CssClassModel } from "../../persistence/css-class-index"
import { ClassTreeDataProvider } from "./class-tree-data-provider"
import { modelsToIndex } from "./files-index"

export class ClassTreeViewContainer {
  private constructor(
    readonly allClassesTree: ClassTreeDataProvider,
    readonly unusedClassesTree: ClassTreeDataProvider,
    private readonly refreshData: () => { all: CssClassModel[]; unused: CssClassModel[] }
  ) {}

  static create(index: CssClassIndex): ClassTreeViewContainer {
    const getAll = new GetAllClasses(index)
    const analyzer = new ClassAnalyzer(new CssClassRepository(index))

    const refreshData = () => {
      return { all: getAll.execute(), unused: analyzer.getUnused() }
    }

    const { all, unused } = refreshData()
    const allClassesTree = new ClassTreeDataProvider(modelsToIndex(all))
    const unusedClassesTree = new ClassTreeDataProvider(modelsToIndex(unused))

    return new ClassTreeViewContainer(allClassesTree, unusedClassesTree, refreshData)
  }

  refresh(): void {
    const { all, unused } = this.refreshData()
    this.allClassesTree.refresh(modelsToIndex(all))
    this.unusedClassesTree.refresh(modelsToIndex(unused))
  }
}
