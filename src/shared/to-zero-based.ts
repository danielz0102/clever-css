import type { Position } from "../domain/location"

/**
 * Converts a 1-based position to a 0-based position.
 * @param position The 1-based position to convert.
 * @returns The converted 0-based position.
 */
export function toZeroBased(position: Position): Position {
  return {
    line: position.line - 1,
    column: position.column - 1,
  }
}
