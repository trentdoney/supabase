import { GraphQLError } from 'graphql'

import { SbError } from './errorModel'
import { IErrorArgs } from './errorSchema'

export function errorResolver(args: IErrorArgs) {
  const error = SbError.find(args)
  if (!error) {
    throw new GraphQLError(
      `Error not found with code "${args.code}" for service "${args.service}"`,
      {
        extensions: {
          code: 'NOT_FOUND',
          arguments: args,
        },
      }
    )
  }
  return error
}
