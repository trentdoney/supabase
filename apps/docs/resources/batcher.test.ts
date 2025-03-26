import { afterEach, beforeEach, describe, vi, Mock, it, expect } from 'vitest'
import { BatchLoader } from './batcher'

describe('BatchLoader', () => {
  let mockLoadFn: Mock
  let loader: BatchLoader<number, string, Error>

  beforeEach(() => {
    mockLoadFn = vi
      .fn()
      .mockImplementation(async (keys: ReadonlyArray<number>) =>
        keys.map((key) => `Value for ${key}`)
      )
    loader = new BatchLoader<number, string, Error>(mockLoadFn)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should batch multiple requests together', async () => {
    const promises = [loader.load(1), loader.load(2), loader.load(3)]

    // Dispatch batch from microtask queue
    await Promise.resolve()
    const results = await Promise.all(promises)

    expect(mockLoadFn).toHaveBeenCalledTimes(1)
    expect(mockLoadFn).toHaveBeenCalledWith([1, 2, 3])
    expect(results).toEqual(['Value for 1', 'Value for 2', 'Value for 3'])
  })

  it('should return cached results for duplicate keys', async () => {
    const [promise1, promise2] = [loader.load(1), loader.load(1)]
    expect(promise1).toBe(promise2)

    loader.load(2)
    loader.load(3)
    expect(mockLoadFn).toHaveBeenCalledTimes(0)

    // Dispatch batch from microtask queue
    await Promise.resolve()
    expect(mockLoadFn).toHaveBeenCalledTimes(1)
    expect(mockLoadFn).toHaveBeenCalledWith([1, 2, 3])

    const result1 = await promise1
    const result2 = await promise2
    expect(result1).toEqual('Value for 1')
    expect(result2).toEqual('Value for 1')
  })

  it('should use the provided toID function', async () => {
    const customToID = vi.fn().mockImplementation((key: { id: number }) => `key-${key.id}`)
    const customLoader = new BatchLoader<{ id: number }, string, Error>(
      async (keys) => keys.map((k) => `Value for ${k.id}`),
      customToID
    )

    await customLoader.load({ id: 1 })
    await customLoader.load({ id: 2 })

    expect(customToID).toHaveBeenCalledWith({ id: 1 })
    expect(customToID).toHaveBeenCalledWith({ id: 2 })
  })

  it('should handle errors from the load function', async () => {
    const errorLoadFn = vi.fn().mockImplementation(async () => {
      throw new Error('Batch load failed')
    })
    const errorLoader = new BatchLoader<number, string, Error>(errorLoadFn, String)

    // Load multiple keys
    const promise1 = errorLoader.load(1)
    const promise2 = errorLoader.load(2)

    // Expect promises to reject
    await expect(promise1).rejects.toThrow('Batch load failed')
    await expect(promise2).rejects.toThrow('Batch load failed')

    // Verify load function was called once
    expect(errorLoadFn).toHaveBeenCalledTimes(1)
  })

  it('should handle individual errors for specific keys', async () => {
    const mixedLoadFn = vi.fn().mockImplementation(async (keys: ReadonlyArray<number>) => {
      return keys.map((key) => {
        if (key === 2) {
          return new Error(`Error for key ${key}`)
        }
        return `Value for ${key}`
      })
    })
    const mixedLoader = new BatchLoader<number, string, Error>(mixedLoadFn, String)

    const [promise1, promise2, promise3] = [
      mixedLoader.load(1),
      mixedLoader.load(2),
      mixedLoader.load(3),
    ]
    await Promise.resolve()
    expect(mixedLoadFn).toHaveBeenCalledTimes(1)

    expect(await promise1).toBe('Value for 1')
    expect(await promise2).toBeInstanceOf(Error)
    expect(((await promise2) as Error).message).toBe('Error for key 2')
    expect(await promise3).toBe('Value for 3')
  })

  it('should batch requests across multiple ticks', async () => {
    // First batch
    const promise1 = loader.load(1)
    const promise2 = loader.load(2)
    await Promise.resolve()

    // Second batch (should be a separate call)
    const promise3 = loader.load(3)
    const promise4 = loader.load(4)
    await Promise.resolve()

    // // Verify load function was called twice with the correct batches
    // expect(mockLoadFn).toHaveBeenCalledTimes(2)
    // expect(mockLoadFn.mock.calls[0][0]).toEqual([1, 2])
    // expect(mockLoadFn.mock.calls[1][0]).toEqual([3, 4])

    // // Check all results
    // expect(await promise1).toBe('Value for 1')
    // expect(await promise2).toBe('Value for 2')
    // expect(await promise3).toBe('Value for 3')
    // expect(await promise4).toBe('Value for 4')
  })
})
