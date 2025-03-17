import { SbError } from './errorModel'
import { IErrorArgs } from './errorSchema'

export function errorResolver(args: IErrorArgs) {
  const error = SbError.find(args)
  return error
}
