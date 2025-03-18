import { z, type ZodRawShape } from 'zod'

export class AppError extends Error {
  constructor(message: string) {
    super(message)
  }

  isPrivate() {
    return true
  }

  statusCode() {
    return 500
  }
}

export class MissingEnvError extends AppError {
  constructor(private missing: string[]) {
    super(`Missing environment variables: ${missing.join(', ')}`)
  }
}

export function parseEnv<T extends ZodRawShape>(schema: z.ZodObject<T>) {
  const env = process.env
  const result = schema.safeParse(env)
  if (!result.success) {
    throw new MissingEnvError(Object.keys(schema.shape))
  }
  return result.data as z.infer<typeof schema>
}

type UnauthorizedErrorType = 'missing_header' | 'invalid_token'

export class UnauthorizedError extends AppError {
  constructor(private _type: UnauthorizedErrorType) {
    const message = _type === 'missing_header' ? 'Missing Authorization header' : 'Invalid token'

    super(message)
  }

  isPrivate() {
    return false
  }

  statusCode() {
    switch (this._type) {
      case 'missing_header':
        return 401
      case 'invalid_token':
        return 403
    }
  }
}

/**
 *
 * @throws UnauthorizedError if the request is not authorized
 */
export function authenticateBearer(req: Request, keys: string) {
  const validKeys = keys.split(',')

  const token = req.headers.get('authorization')?.replace(/^bearer\s+/i, '')
  if (!token) throw new UnauthorizedError('missing_header')
  if (!validKeys.includes(token)) throw new UnauthorizedError('invalid_token')
}

export class InvalidRequestError extends AppError {
  constructor(message: string) {
    super(message)
  }

  isPrivate() {
    return false
  }

  statusCode() {
    return 400
  }
}
