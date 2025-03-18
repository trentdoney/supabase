import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '~/app/api/internal/graphql/route'
import { SbError } from '~/resources/error/errorModel'

const originalEnv = { ...process.env }

// Mock SbError.find method
vi.mock('~/resources/error/errorModel', async () => {
  const actual = await vi.importActual<typeof import('~/resources/error/errorModel')>(
    '~/resources/error/errorModel'
  )
  return {
    ...actual,
    SbError: {
      ...actual.SbError,
      find: vi.fn(),
      genId: vi.fn((args) => `${args.service}::${args.code}`),
    },
  }
})

describe('GraphQL API Route', () => {
  let mockRequest: Request

  beforeEach(() => {
    // Reset mocks between tests
    vi.resetAllMocks()

    process.env = {
      ...originalEnv,
      INTERNAL_DOCS_API_KEYS: 'test-key-1,test-key-2',
    }

    // Create a basic mock request with valid authentication
    mockRequest = new Request('http://localhost:3001/docs/api/internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key-1',
      },
      body: JSON.stringify({
        query: `query { error(code: "user_not_found", service: AUTH) { id code service message } }`,
      }),
    })
  })

  afterEach(() => {
    process.env = originalEnv
    vi.resetAllMocks()
  })

  it('should return 401 if authorization header is missing', async () => {
    const requestWithoutAuth = new Request('http://localhost:3001/docs/api/internal/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { error(code: "user_not_found", service: AUTH) { id code service message } }`,
      }),
    })

    const response = await POST(requestWithoutAuth)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Missing Authorization header')
  })

  it('should return 403 if authorization token is invalid', async () => {
    const requestWithInvalidToken = new Request('http://localhost:3001/docs/api/internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid-token',
      },
      body: JSON.stringify({
        query: `query { error(code: "user_not_found", service: AUTH) { id code service message } }`,
      }),
    })

    const response = await POST(requestWithInvalidToken)

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Invalid token')
  })

  it('should return 400 if request body is not valid JSON', async () => {
    const requestWithInvalidJSON = new Request('http://localhost:3001/docs/api/internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key-1',
      },
      body: 'not-json',
    })

    const response = await POST(requestWithInvalidJSON)

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid JSON body')
  })

  it('should return 400 if GraphQL query is missing', async () => {
    const requestWithoutQuery = new Request('http://localhost:3001/docs/api/internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key-1',
      },
      body: JSON.stringify({}),
    })

    const response = await POST(requestWithoutQuery)

    expect(response.status).toBe(400)
    expect(await response.text()).toContain('Invalid GraphQL request format')
  })

  it('should successfully query an error and return it', async () => {
    // Mock the error to be returned
    const mockError = {
      id: 'AUTH::user_not_found',
      code: 'user_not_found',
      service: 'AUTH',
      message: 'User to which the API request relates no longer exists.',
    }

    vi.mocked(SbError.find).mockReturnValue(mockError as any)

    const response = await POST(mockRequest)

    expect(response.status).toBe(200)
    const responseBody = await response.json()

    expect(responseBody).toEqual({
      data: {
        error: {
          id: 'AUTH::user_not_found',
          code: 'user_not_found',
          service: 'AUTH',
          message: 'User to which the API request relates no longer exists.',
        },
      },
    })
  })

  it('should return GraphQL error when error is not found', async () => {
    // Mock error not found
    vi.mocked(SbError.find).mockReturnValue(undefined)

    const response = await POST(mockRequest)

    expect(response.status).toBe(200)
    const responseBody = await response.json()

    expect(responseBody.errors).toBeDefined()
    expect(responseBody.errors[0].message).toContain('Error not found with code')
    expect(responseBody.errors[0].extensions.code).toBe('NOT_FOUND')
  })

  it('should handle query with variables correctly', async () => {
    // Mock the error to be returned
    const mockError: SbError = {
      id: 'AUTH::email_exists',
      code: 'email_exists',
      service: 'AUTH',
      message: 'Email address already exists in the system.',
    }
    vi.mocked(SbError.find).mockReturnValue(mockError)

    const requestWithVariables = new Request('http://localhost:3001/docs/api/internal/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key-1',
      },
      body: JSON.stringify({
        query: `query GetError($code: String!, $service: Service!) {
          error(code: $code, service: $service) {
            id
            code
            service
            message
          }
        }`,
        variables: {
          code: 'email_exists',
          service: 'AUTH',
        },
      }),
    })

    const response = await POST(requestWithVariables)
    expect(response.status).toBe(200)
    const responseBody = await response.json()
    expect(responseBody).toEqual({
      data: {
        error: {
          id: 'AUTH::email_exists',
          code: 'email_exists',
          service: 'AUTH',
          message: 'Email address already exists in the system.',
        },
      },
    })
  })

  it('should handle unexpected errors gracefully', async () => {
    // Mock an unexpected error during execution
    vi.mocked(SbError.find).mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const response = await POST(mockRequest)
    expect(response.status).toBe(200)
    const responseBody = await response.json()
    expect(responseBody.errors[0].message).toBe('Unexpected error')
  })
})
