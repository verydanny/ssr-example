export type ModuleIdFunc = string | number

export type UpdateChunk = (id: ModuleIdFunc, isStatic: boolean) => void

export class AsyncChunkManager {
  recordChunk: UpdateChunk

  constructor(updateChunk: UpdateChunk) {
    this.recordChunk = updateChunk
  }
}
