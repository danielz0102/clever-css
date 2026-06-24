export type EditorLocation = {
  uri: string
  start: { line: number; column: number }
  end: { line: number; column: number }
}

export type CSSClassRecord = {
  className: string
  definitions: EditorLocation[]
  usages: EditorLocation[]
}

export const index = new Map<string, CSSClassRecord>()
export type CSSClassIndex = typeof index
