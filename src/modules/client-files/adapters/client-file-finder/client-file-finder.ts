export interface ClientFileFinder {
  find(): Promise<string[]>
}
