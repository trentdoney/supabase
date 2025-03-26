export type BatchLoadFn<K, V, E extends Error> = (keys: ReadonlyArray<K>) => Promise<Array<V | E>>
export type ToID<K> = (key: K) => string

export class BatchLoader<K, V, E extends Error> {
  private toID: ToID<K> = (key) => String(key)
  private batch = new Set<K>()
  private cache = new Map<string, Promise<V | E | undefined>>()
  private loadFn: BatchLoadFn<K, V, E>
  private resolvers = new Map<string, (value: V | E | undefined) => void>()
  private rejectors = new Map<string, (reason: any) => void>()
  private scheduledBatch = false

  constructor(loadFn: BatchLoadFn<K, V, E>, toID?: ToID<K>) {
    this.loadFn = loadFn
    if (toID) {
      this.toID = toID
    }
  }

  load(key: K): Promise<V | E | undefined> {
    const stringKey = this.toID(key)
    if (this.cache.has(stringKey)) {
      return this.cache.get(stringKey)
    }

    this.batch.add(key)
    const promise = new Promise<V | E | undefined>((resolve, reject) => {
      this.resolvers.set(stringKey, resolve)
      this.rejectors.set(stringKey, reject)
    })
    this.cache.set(stringKey, promise)

    if (!this.scheduledBatch) {
      this.scheduledBatch = true
      Promise.resolve().then(() => this.dispatchBatch())
    }
    return promise
  }

  private async dispatchBatch() {
    const batch = [...this.batch]
    this.reset()

    try {
      const results = await this.loadFn(batch)
      results.forEach((result, idx) => {
        const stringKey = this.toID(batch[idx])
        const resolver = this.resolvers.get(stringKey)
        if (resolver) {
          resolver(result)
          this.markDone(stringKey)
        }
      })
    } catch (err) {
      batch.forEach((key) => {
        const stringKey = this.toID(key)
        const rejector = this.rejectors.get(stringKey)
        if (rejector) {
          rejector(err)
          this.markDone(stringKey)
        }
      })
    }
  }

  private reset() {
    this.batch.clear()
    this.scheduledBatch = false
  }

  private markDone(stringKey: string) {
    this.resolvers.delete(stringKey)
    this.rejectors.delete(stringKey)
  }
}
