import OpenAI from 'openai'
import 'server-only'
import {
  InvalidRequestError,
  ApiError,
  ApiErrorGeneric,
  convertUnknownToApiError,
  extractMessageFromAnyError,
} from '~/app/api/utils'
import { Result } from '~/features/helpers.fn'

type Embedding = Array<number>

interface ModerationFlaggedDetails {
  flagged: boolean
  categories: OpenAI.Moderations.Moderation.Categories
}

export interface OpenAICompletionOptions {
  model?: string
  temperature?: number
  systemPrompt?: string
  responseFormat?: { type: 'text' | 'json_object' }
}

export interface OpenAIClientInterface {
  createContentEmbedding(text: string): Promise<Result<Embedding, ApiErrorGeneric>>
  
  createCompletion(
    prompt: string,
    options?: OpenAICompletionOptions
  ): Promise<Result<string, Error>>
  
  createCompletion<T, E = Error>(
    prompt: string,
    options: OpenAICompletionOptions | undefined,
    parseResponse: (content: string) => Result<T, E>
  ): Promise<Result<T, Error | E>>
}

let openAIClient: OpenAIClientInterface | null

class OpenAIClient implements OpenAIClientInterface {
  static CONTENT_EMBEDDING_MODEL = 'text-embedding-ada-002'
  static DEFAULT_CHAT_MODEL = 'gpt-4o'

  constructor(private client: OpenAI) {}

  async createContentEmbedding(text: string): Promise<Result<Embedding, ApiErrorGeneric>> {
    return await Result.tryCatchFlat(
      this.createContentEmbeddingImpl.bind(this),
      convertUnknownToApiError,
      text
    )
  }

  async createCompletion(
    prompt: string,
    options?: OpenAICompletionOptions
  ): Promise<Result<string, Error>>
  
  async createCompletion<T, E = Error>(
    prompt: string,
    options: OpenAICompletionOptions | undefined,
    parseResponse: (content: string) => Result<T, E>
  ): Promise<Result<T, Error | E>>
  
  async createCompletion<T = string, E = Error>(
    prompt: string,
    options?: OpenAICompletionOptions,
    parseResponse?: (content: string) => Result<T, E>
  ): Promise<any> {
    if (parseResponse) {
      return await Result.tryCatchFlat(
        this.createCompletionImplWithParser.bind(this),
        (err) =>
          new Error(`Failed to create completion with OpenAI: ${extractMessageFromAnyError(err)}`, {
            cause: err,
          }),
        prompt,
        options,
        parseResponse
      )
    } else {
      return await Result.tryCatchFlat(
        this.createCompletionImplString.bind(this),
        (err) =>
          new Error(`Failed to create completion with OpenAI: ${extractMessageFromAnyError(err)}`, {
            cause: err,
          }),
        prompt,
        options
      )
    }
  }

  private async createContentEmbeddingImpl(
    text: string
  ): Promise<Result<Embedding, ApiError<ModerationFlaggedDetails>>> {
    const query = text.trim()

    const moderationResponse = await this.client.moderations.create({ input: query })
    const [result] = moderationResponse.results
    if (result.flagged) {
      return Result.error(
        new InvalidRequestError('Content flagged as inappropriate', undefined, {
          flagged: true,
          categories: result.categories,
        })
      )
    }

    const embeddingsResponse = await this.client.embeddings.create({
      model: OpenAIClient.CONTENT_EMBEDDING_MODEL,
      input: query,
    })
    const [{ embedding: queryEmbedding }] = embeddingsResponse.data
    return Result.ok(queryEmbedding)
  }

  private async createCompletionImplString(
    prompt: string,
    options?: OpenAICompletionOptions
  ): Promise<Result<string, Error>> {
    const {
      model = OpenAIClient.DEFAULT_CHAT_MODEL,
      temperature = 0,
      systemPrompt = 'You are a helpful assistant.',
      responseFormat = { type: 'text' },
    } = options || {}

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]

    const chatResponse = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      ...(responseFormat.type === 'json_object' && { response_format: responseFormat }),
    })

    const resultContent = chatResponse.choices[0]?.message?.content
    if (!resultContent) {
      return Result.error(new Error('No response from OpenAI'))
    }

    return Result.ok(resultContent)
  }

  private async createCompletionImplWithParser<T, E>(
    prompt: string,
    options: OpenAICompletionOptions | undefined,
    parseResponse: (content: string) => Result<T, E>
  ): Promise<Result<T, Error | E>> {
    const {
      model = OpenAIClient.DEFAULT_CHAT_MODEL,
      temperature = 0,
      systemPrompt = 'You are a helpful assistant.',
      responseFormat = { type: 'text' },
    } = options || {}

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]

    const chatResponse = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      ...(responseFormat.type === 'json_object' && { response_format: responseFormat }),
    })

    const resultContent = chatResponse.choices[0]?.message?.content
    if (!resultContent) {
      return Result.error(new Error('No response from OpenAI'))
    }

    return parseResponse(resultContent)
  }
}

export function openAI(): OpenAIClientInterface {
  if (!openAIClient) {
    openAIClient = new OpenAIClient(new OpenAI())
  }
  return openAIClient
}
