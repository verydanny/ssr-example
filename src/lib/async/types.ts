export type DynamicImport<T> = T | { default: T }

export interface CreateLoader<T> {
  id?: string | number
  attemptSync: boolean
  resolved: null | T
  resolve: () => Promise<T | null>
}
