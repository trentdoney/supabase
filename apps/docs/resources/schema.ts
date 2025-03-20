import { GraphQLSchema, GraphQLObjectType } from 'graphql'
import { errorSchema, errorsSchema } from './error/errorSchema'

export const rootSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      ...errorsSchema,
      ...errorSchema,
    },
  }),
})
