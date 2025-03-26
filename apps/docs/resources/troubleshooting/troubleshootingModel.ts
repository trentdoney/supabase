import {
  genEmbeddingSymbol,
  searchSimilarSymbol,
  vectorSearch,
  type VectorSearchable,
} from '../interfaces/vector'

export class TroubleshootingModel implements VectorSearchable<unknown> {
  private raw: string

  async [genEmbeddingSymbol]() {
    return []
  }
  async [searchSimilarSymbol]() {
    return vectorSearch(this)
  }
}
