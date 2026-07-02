import type { Token } from "../../../dtos/token-dto"
import { makeLocationFrom } from "./css-class-mother"

export function makeToken({ className, uri }: { className: string; uri: string }): Token {
  return {
    name: className,
    location: makeLocationFrom(uri),
  }
}
