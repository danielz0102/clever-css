export type EditorLocation = {
  uri: string
  start: { line: number; column: number }
  end: { line: number; column: number }
}

export type CssClassRecord = {
  className: string
  definitions: EditorLocation[]
  usages: EditorLocation[]
}

export const index = new Map<string, CssClassRecord>()
export type CssClassIndex = typeof index
