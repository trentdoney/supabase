'use client'

import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { ComponentProps, useEffect, useState } from 'react'

const DynamicGraphiQL = dynamic(
  async () => {
    const { GraphiQL } = await import('graphiql')
    const { createGraphiQLFetcher } = await import('@graphiql/toolkit')
    await import('graphiql/graphiql.css')

    return function GraphiQLWithFetcher(props: Omit<ComponentProps<typeof GraphiQL>, 'fetcher'>) {
      const [token, setToken] = useState('')

      useEffect(() => {
        const authToken = localStorage.getItem('dev.docs.graphiql.token')
        setToken(authToken)
      }, [])

      if (!token) {
        return <AuthForm onAuth={setToken} />
      }

      const fetcher = createGraphiQLFetcher({
        url: 'http://localhost:3001/docs/api/internal/graphql',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })
      return <GraphiQL fetcher={fetcher} {...props} />
    }
  },
  {
    loading: () => <div className="p-6">Loading GraphiQL...</div>,
    ssr: false,
  }
)

function AuthForm({ onAuth }) {
  const [inputToken, setInputToken] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    localStorage.setItem('dev.docs.graphiql.token', inputToken)
    onAuth(inputToken)
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block mb-2">
            API Token:
          </label>
          <input
            id="token"
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your authentication token"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Authenticate
        </button>
      </form>
    </div>
  )
}

export default function GraphiQLPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return <DynamicGraphiQL className="!h-[calc(100vh-var(--header-height))]" />
}
