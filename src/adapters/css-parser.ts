import { Lang, parse } from "@ast-grep/napi"

import type { CssFileDto } from "../dtos/css-file-dto"
import type { Token } from "../dtos/token-dto"

export type CssClassParser = (file: CssFileDto) => Token[]

export const parseCssClassTokens: CssClassParser = (file) => {
  const ast = parse(Lang.Css, file.content)
  const nodes = ast
    .root()
    .findAll({ rule: { kind: "class_name", inside: { kind: "class_selector", stopBy: "end" } } })
  return nodes.flatMap((node) => {
    const range = node.range()
    return {
      name: node.text(),
      location: {
        uri: file.uri,
        start: range.start,
        end: range.end,
      },
    }
  })
}

export function parseCssClassRule(text: string, className: string): string | undefined {
  const ast = parse(Lang.Css, text)
  const rule = ast.root().find(`.${className} {$$$}`)

  if (!rule) {
    return
  }

  return rule.text()
}
