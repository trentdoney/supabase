import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql'

export type ArgDefinition<T = any> = {
  type: GraphQLInputType
  description?: string
  defaultValue?: T
  required?: boolean
}

type InferGraphQLEnumType<T extends GraphQLEnumType> = ReturnType<
  T['getValues']
>[number]['name'] extends infer V
  ? V extends string
    ? V
    : never
  : never

type InferGraphQLScalarType<T extends GraphQLScalarType<any, any>> =
  T extends GraphQLScalarType<infer _Internal, infer External> ? External : never

type InferGraphQLInputObjectType<T extends GraphQLInputObjectType> = {
  [K in keyof ReturnType<T['getFields']>]: InferGraphQLInputType<
    ReturnType<T['getFields']>[K]['type']
  >
}

type InferGraphQLListType<T extends GraphQLList<any>> =
  T extends GraphQLList<infer L>
    ? L extends GraphQLInputType
      ? Array<InferGraphQLInputType<L>>
      : never
    : never

type InferGraphQLNonNullType<T extends GraphQLNonNull<any>> =
  T extends GraphQLNonNull<infer U>
    ? U extends GraphQLEnumType
      ? InferGraphQLEnumType<U>
      : U extends GraphQLScalarType
        ? InferGraphQLScalarType<U>
        : U extends GraphQLInputObjectType
          ? InferGraphQLInputObjectType<U>
          : U extends GraphQLList<any>
            ? InferGraphQLListType<U>
            : never
    : never

type InferGraphQLNullableType<T extends GraphQLNullableType> = T extends GraphQLEnumType
  ? InferGraphQLEnumType<T> | null
  : T extends GraphQLScalarType<any, any>
    ? InferGraphQLScalarType<T> | null
    : T extends GraphQLInputObjectType
      ? InferGraphQLInputObjectType<T> | null
      : T extends GraphQLList<any>
        ? InferGraphQLListType<T> | null
        : null

type InferGraphQLInputType<T extends GraphQLInputType> =
  T extends GraphQLNonNull<any> ? InferGraphQLNonNullType<T> : InferGraphQLNullableType<T>

type RequiredKeys<T extends Record<string, ArgDefinition>> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never
}[keyof T]

type OptionalKeys<T extends Record<string, ArgDefinition>> = {
  [K in keyof T]: T[K] extends { required: true } ? never : K
}[keyof T]

export type InferArgTypes<T extends Record<string, ArgDefinition>> = {
  [K in RequiredKeys<T>]: InferGraphQLInputType<T[K]['type']>
} & {
  [K in OptionalKeys<T>]?: InferGraphQLInputType<T[K]['type']>
}

export const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection',
  fields: {
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether there are more items after the current page',
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether there are more items before the current page',
    },
    startCursor: {
      type: GraphQLString,
      description: 'Cursor pointing to the start of the current page',
    },
    endCursor: {
      type: GraphQLString,
      description: 'Cursor pointing to the end of the current page',
    },
  },
})

/**
 * Creates an Edge type for a specific node type
 * @param nodeType The GraphQL Object type for the node
 * @param name Optional name for the edge (defaults to NodeType + 'Edge')
 * @returns A GraphQL Object Type for the edge
 */
export function createEdgeType(nodeType: GraphQLOutputType, name?: string): GraphQLObjectType {
  const edgeName = name || `${(nodeType as any).name}Edge`

  return new GraphQLObjectType({
    name: edgeName,
    description: `An edge in a connection for ${(nodeType as any).name}`,
    fields: {
      node: {
        type: new GraphQLNonNull(nodeType),
        description: 'The item at the end of the edge',
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'A cursor for use in pagination',
      },
    },
  })
}

/**
 * Creates a Connection type for a specific node type
 * @param nodeType The GraphQL Object type for the node
 * @param name Optional name for the connection (defaults to NodeType + 'Connection')
 * @returns A GraphQL Object Type for the connection
 */
export function createConnectionType(
  nodeType: GraphQLOutputType,
  name?: string
): GraphQLObjectType {
  const connectionName = name || `${(nodeType as any).name}Connection`
  const edgeType = createEdgeType(nodeType)

  return new GraphQLObjectType({
    name: connectionName,
    description: `A connection to a list of ${(nodeType as any).name} items`,
    fields: {
      edges: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(edgeType))),
        description: 'A list of edges containing nodes in this connection',
      },
      nodes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(nodeType))),
        description: 'The nodes in this connection, directly accessible',
      },
      pageInfo: {
        type: new GraphQLNonNull(PageInfoType),
        description: 'Information to aid in pagination',
      },
      totalCount: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The total count of items available in this connection',
      },
    },
  })
}

/**
 * Standard pagination arguments for GraphQL fields
 */
export const paginationArgs = {
  first: {
    type: GraphQLInt,
    description: 'Returns the first n elements from the list',
  },
  after: {
    type: GraphQLString,
    description: 'Returns elements that come after the specified cursor',
  },
  last: {
    type: GraphQLInt,
    description: 'Returns the last n elements from the list',
  },
  before: {
    type: GraphQLString,
    description: 'Returns elements that come before the specified cursor',
  },
}

export class GraphQLEdgeCollection<T> {
  /** The array of nodes/items in the collection */
  nodes: T[]

  /** The total count of items available in the collection */
  totalCount: number

  /** Information about the pagination state */
  pageInfo: {
    /** Whether there are more items after the current page */
    hasNextPage: boolean
    /** Whether there are more items before the current page */
    hasPreviousPage: boolean
    /** Cursor pointing to the start of the current page */
    startCursor: string | null
    /** Cursor pointing to the end of the current page */
    endCursor: string | null
  }

  constructor(data: {
    nodes: T[]
    totalCount: number
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string | null
      endCursor: string | null
    }
  }) {
    this.nodes = data.nodes
    this.totalCount = data.totalCount
    this.pageInfo = data.pageInfo
  }

  /**
   * Returns whether the collection is empty
   */
  isEmpty(): boolean {
    return this.nodes.length === 0
  }

  /**
   * Maps over the nodes in the collection and returns a new collection
   */
  map<U>(fn: (item: T, index: number) => U): GraphQLEdgeCollection<U> {
    return new GraphQLEdgeCollection({
      nodes: this.nodes.map(fn),
      totalCount: this.totalCount,
      pageInfo: this.pageInfo,
    })
  }
}
