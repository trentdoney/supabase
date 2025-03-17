import { graphql } from 'graphql'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { AppError, authenticateBearer, InvalidRequestError, parseEnv } from '~/app/api/utils'
import { rootResolver } from '~/resources/resolver'
import { rootSchema } from '~/resources/schema'

export const runtime = 'edge'

const envSchema = z.object({
  INTERNAL_DOCS_API_KEYS: z.string().min(1),
})

const requestSchema = z.object({
  query: z.string().min(1),
  variables: z.record(z.any()).optional(),
  operationName: z.string().optional(),
})

async function handler(req: Request): Promise<NextResponse> {
  const env = parseEnv(envSchema)
  authenticateBearer(req, env.INTERNAL_DOCS_API_KEYS)

  const body = await req.json().catch(() => {
    throw new InvalidRequestError('Invalid JSON body')
  })
  const parsedBody = requestSchema.safeParse(body)
  if (!parsedBody.success) {
    throw new InvalidRequestError(`Invalid GraphQL request format: ${parsedBody.error.message}`)
  }
  const { query, variables, operationName } = parsedBody.data

  const result = await graphql({
    schema: rootSchema,
    rootValue: rootResolver,
    contextValue: { req },
    source: query,
    variableValues: variables,
    operationName,
  })
  return NextResponse.json(result)
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    return await handler(req)
  } catch (err: unknown) {
    console.error(err)
    if (err instanceof AppError) {
      return new NextResponse(err.message, { status: err.statusCode() })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
