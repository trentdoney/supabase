import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  type GraphQLObjectTypeConfig,
} from 'graphql'
import { createConnectionType, InferArgTypes } from '../common'

const serviceEnumType = new GraphQLEnumType({
  name: 'Service',
  values: {
    AUTH: { value: 'AUTH' },
    REALTIME: { value: 'REALTIME' },
    STORAGE: { value: 'STORAGE' },
  },
})

const errorArgs = {
  statusCode: {
    type: GraphQLInt,
    description:
      'The status code of the error. If both statusCode and code are provided, the result must match both to be returned.',
  },
  code: {
    required: true,
    type: GraphQLString,
    description:
      'The string code of the error. If both statusCode and code are provided, the result must match both to be returned.',
  },
  service: {
    required: true,
    type: serviceEnumType,
  },
} as const // const needed for proper type inference of required fields
export type IErrorArgs = InferArgTypes<typeof errorArgs>

const errorType = new GraphQLObjectType({
  name: 'Error',
  fields: {
    id: {
      type: GraphQLID,
    },
    statusCode: {
      type: GraphQLInt,
    },
    code: {
      type: GraphQLString,
    },
    service: { type: serviceEnumType },
  },
})

export const errorSchema = {
  error: {
    args: errorArgs,
    type: errorType,
  },
} satisfies GraphQLObjectTypeConfig<unknown, unknown>['fields']

export const errorsSchema = {
  errors: { type: createConnectionType(errorType) },
}
