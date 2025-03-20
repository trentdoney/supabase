import { errorResolver, errorsResolver } from './error/errorResolver'

export const rootResolver = {
  error: errorResolver,
  errors: errorsResolver,
}
