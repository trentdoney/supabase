import '../../scripts/utils/dotenv'

import { readFile } from 'fs/promises'
import { styleText, parseArgs } from 'node:util'
import { openAI } from '~/lib/openAi'
import { Result } from '~/features/helpers.fn'
import { z } from 'zod'
import { fileURLToPath } from 'node:url'

// Schema definitions
const CallGraphSchema = z.object({
  directCalls: z.record(z.array(z.string())),
  methodCalls: z.record(z.array(z.string())),
  transitiveCalls: z.record(z.array(z.string())).optional(),
})

export type CallGraph = z.infer<typeof CallGraphSchema>

export interface MapMethodsOptions {
  sources: Array<{ type: 'file'; path: string } | { type: 'url'; url: string }>
  targetMethods: string[]
}

export async function mapMethodsToEndpoints(
  options: MapMethodsOptions
): Promise<Result<Record<string, string[]>, Error>> {
  const { sources, targetMethods } = options

  // Set up annotated logger
  const TAG = '[ReferenceSDK Build]'
  const LOG_TAG = styleText('blue', TAG)
  const ERROR_TAG = styleText('red', TAG)

  function logWithTag(message: string) {
    console.log(`${LOG_TAG} ${message}`)
  }

  function errorWithTag(message: string) {
    console.error(`${ERROR_TAG} ${message}`)
  }

  // Initialize empty call graph
  let callGraph: CallGraph = {
    directCalls: {},
    methodCalls: {},
  }

  // Process each source
  for (const source of sources) {
    const sourceName = source.type === 'file' ? source.path : source.url
    logWithTag(`Processing ${source.type}: ${sourceName}`)

    const sourceCodeResult = await Result.tryCatch(
      async () => {
        if (source.type === 'file') {
          return await readFile(source.path, 'utf-8')
        } else {
          const response = await fetch(source.url)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          return await response.text()
        }
      },
      (err) => new Error(`Failed to read ${source.type} ${sourceName}`, { cause: err })
    )

    if (!sourceCodeResult.isOk()) {
      return sourceCodeResult.mapError(
        () => new Error('Failed to read source')
      ) as unknown as Result<Record<string, string[]>, Error>
    }

    const sourceCode = sourceCodeResult.unwrap()
    const result = await analyzeSourceCode(sourceCode, callGraph)

    if (!result.isOk()) {
      errorWithTag(`Failed to analyze ${sourceName}: ${result.mapError((e) => e.message).unwrap()}`)
      // Continue with current state on error
      continue
    }

    callGraph = result.unwrap()
  }

  // Compute transitive closure
  const transitiveMappings = computeTransitiveClosure(callGraph)

  // Build final result: endpoint -> method mapping for requested methods
  const endpointToMethods: Record<string, string[]> = {}

  for (const method of targetMethods) {
    const endpoints = transitiveMappings[method] || []
    for (const endpoint of endpoints) {
      // Clean the endpoint by removing ${this.url} prefix
      const cleanEndpoint = endpoint.replace(/^\$\{this\.url\}/, '')
      
      // Aggregate all methods that map to this endpoint
      if (!endpointToMethods[cleanEndpoint]) {
        endpointToMethods[cleanEndpoint] = []
      }
      if (!endpointToMethods[cleanEndpoint].includes(method)) {
        endpointToMethods[cleanEndpoint].push(method)
      }
    }
  }

  return Result.ok(endpointToMethods)
}

async function analyzeSourceCode(
  sourceCode: string,
  existingMappings: CallGraph
): Promise<Result<CallGraph, Error>> {
  const prompt = `You are a code analysis assistant that tracks method calls and REST endpoints.

CURRENT STATE:
Direct REST calls: ${JSON.stringify(existingMappings.directCalls, null, 2)}
Method-to-method calls: ${JSON.stringify(existingMappings.methodCalls, null, 2)}

ANALYZE THIS CODE:
${sourceCode}

TASKS:
1. Find all functions/methods that directly call REST endpoints (fetch, axios, http calls, or any HTTP client)
2. Find all method-to-method calls (including function calls, class method calls, etc.)
3. Update the state by adding new findings

RULES:
- Only report what you actually see in the code
- REST endpoints must be explicit (strings or clear template literals)
- Include all function/method names, not just specific ones
- Preserve all existing mappings from the current state
- Return the complete updated state
- If a method calls multiple endpoints, include all of them
- Method names should be the exact names as they appear in the code

RETURN FORMAT:
{
  "directCalls": {
    "methodName": ["endpoint1", "endpoint2"]
  },
  "methodCalls": {
    "callerMethod": ["calleeMethod1", "calleeMethod2"]
  }
}`

  const parseCallGraph = (content: string): Result<CallGraph, Error> => {
    return Result.tryCatchSync(
      () => {
        const parsed = JSON.parse(content)
        return CallGraphSchema.parse(parsed)
      },
      (err) => {
        if (err instanceof z.ZodError) {
          return new Error('Invalid CallGraph structure from OpenAI', { cause: err })
        }
        return new Error('Failed to parse JSON response', { cause: err })
      }
    )
  }

  const result = await openAI().createCompletion<CallGraph, Error>(
    prompt,
    {
      model: 'gpt-4o', // Using latest model
      temperature: 0,
      systemPrompt:
        'You are a code analysis expert. Return only valid JSON without any markdown formatting or code blocks.',
      responseFormat: { type: 'json_object' },
    },
    parseCallGraph
  )

  return result
}

function computeTransitiveClosure(graph: CallGraph): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  // First, copy all direct calls
  for (const [method, endpoints] of Object.entries(graph.directCalls)) {
    result[method] = Array.isArray(endpoints) ? [...endpoints] : []
  }

  // Then, for each method that calls other methods, find all reachable endpoints
  const allMethods = new Set([...Object.keys(graph.directCalls), ...Object.keys(graph.methodCalls)])

  for (const method of allMethods) {
    if (!result[method]) {
      result[method] = []
    }

    const visited = new Set<string>()
    const endpoints = findReachableEndpoints(method, graph, visited)

    // Merge with existing direct calls and deduplicate
    const existing = Array.isArray(result[method]) ? result[method] : []
    const endpointsArray = Array.isArray(endpoints) ? endpoints : []
    result[method] = [...new Set([...existing, ...endpointsArray])]
  }

  return result
}

function findReachableEndpoints(method: string, graph: CallGraph, visited: Set<string>): string[] {
  // Prevent infinite recursion from circular dependencies
  if (visited.has(method)) {
    return []
  }

  visited.add(method)

  // Start with direct endpoints from this method
  const directCalls = graph.directCalls[method]
  let endpoints: string[] = Array.isArray(directCalls) ? directCalls : []

  // Add endpoints from all methods this one calls
  const calledMethods = graph.methodCalls[method]
  const calledMethodsArray = Array.isArray(calledMethods) ? calledMethods : []
  
  for (const callee of calledMethodsArray) {
    const calleeEndpoints = findReachableEndpoints(callee, graph, visited)
    if (Array.isArray(calleeEndpoints)) {
      endpoints = [...endpoints, ...calleeEndpoints]
    } else {
      console.warn(`findReachableEndpoints returned non-array for method: ${callee}`, calleeEndpoints)
    }
  }

  visited.delete(method)

  return endpoints
}

// CLI interface
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  async function main() {
    const options = {
      'methods-file': {
        type: 'string' as const,
        short: 'm',
      },
      'output-json': {
        type: 'boolean' as const,
        short: 'j',
        default: false,
      },
      help: {
        type: 'boolean' as const,
        short: 'h',
        default: false,
      },
    }

    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options,
      allowPositionals: true,
    })

    if (values.help || (!values['methods-file'] && positionals.length === 0)) {
      console.error('Usage: tsx referenceSDKBuild.ts [options] <source1> [source2] ...')
      console.error('\nOptions:')
      console.error(
        '  -m, --methods-file <file>  Text file with one method name per line (required)'
      )
      console.error('  -j, --output-json          Output only the JSON mapping to stdout')
      console.error('  -h, --help                 Show this help message')
      console.error('\nSources:')
      console.error('  sources: Source code files or URLs to analyze')
      console.error('    - File path: ./path/to/file.ts')
      console.error('    - URL: https://example.com/source.ts')
      process.exit(1)
    }

    const methodsFile = values['methods-file']
    const outputJson = values['output-json']
    const sourcePaths = positionals

    if (!methodsFile) {
      console.error('Error: --methods-file is required')
      process.exit(1)
    }

    if (sourcePaths.length === 0) {
      console.error('Error: At least one source file or URL must be provided')
      process.exit(1)
    }

    try {
      // Read target methods from file
      const methodsContent = await readFile(methodsFile, 'utf-8')
      const targetMethods = methodsContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      // Parse sources into appropriate format
      const sources = sourcePaths.map((path) => {
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return { type: 'url' as const, url: path }
        } else {
          return { type: 'file' as const, path }
        }
      })

      if (!outputJson) {
        console.log(`Target methods: ${targetMethods.join(', ')}`)
        console.log(`Sources:`)
        sources.forEach((source) => {
          if (source.type === 'file') {
            console.log(`  - File: ${source.path}`)
          } else {
            console.log(`  - URL: ${source.url}`)
          }
        })
      }

      // Run the mapping
      const result = await mapMethodsToEndpoints({
        sources,
        targetMethods,
      })

      result.match(
        (mappings) => {
          if (outputJson) {
            // Output only JSON to stdout for piping
            console.log(JSON.stringify(mappings, null, 2))
          } else {
            console.log('\nMethod to Endpoint Mappings:')
            console.log(JSON.stringify(mappings, null, 2))
          }
        },
        (error) => {
          console.error('\nError:', error.message)
          process.exit(1)
        }
      )
    } catch (error) {
      console.error('Fatal error:', error)
      process.exit(1)
    }
  }

  main()
}
