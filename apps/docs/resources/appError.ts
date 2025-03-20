type ErrorCode = 'NO_SUCH_EDGE'

class ResourceError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string
  ) {
    super(message)
  }
}

export class NoSuchEdgeError extends ResourceError {
  constructor(message: string) {
    super('NO_SUCH_EDGE', message)
  }
}

export class Result<T> {
  constructor(private data: { data: T; err: null } | { data: null; err: ResourceError }) {}

  static ok<T>(data: T): Result<T> {
    return new Result({ data, err: null })
  }

  static err<T>(err: ResourceError): Result<T> {
    return new Result({ data: null, err })
  }

  static async tryCatch<A extends [], R>(
    fn: (...args: A) => Promise<R>,
    ...args: A
  ): Promise<Result<R>> {
    try {
      const data = await fn(...args)
      return Result.ok(data)
    } catch (err) {
      return Result.err(err)
    }
  }
}
