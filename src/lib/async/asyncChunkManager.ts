export type ModuleIdFunc = string | number

export type UpdateChunk = (id: ModuleIdFunc, isStatic: boolean) => void

export class AsyncChunkManager {
  private recordCallback?: Function

  recordChunk(id: ModuleIdFunc, isStatic: boolean) {
    return this.recordCallback && this.recordCallback(id, isStatic)
  }

  recordAssetsCallback<T extends Function>(fn: T) {
    if (!this.recordCallback) {
      this.recordCallback = fn
    }
  }
}
