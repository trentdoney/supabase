import {
  VectorSearchable,
  genEmbeddingSymbol,
  searchSimilarSymbol,
  vectorSearch,
} from '../interfaces/vector'

export abstract class MarkdownModel<SearchResult> implements VectorSearchable<SearchResult> {
  abstract toDocsSiteCompatible(): string
  abstract genEditLink(): string

  [genEmbeddingSymbol]() {
    return Promise.resolve([])
  }
  [searchSimilarSymbol]() {
    return vectorSearch(this)
  }
}
