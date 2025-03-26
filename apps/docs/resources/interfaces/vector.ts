export const genEmbeddingSymbol = Symbol('GenEmbedding')
export const searchSimilarSymbol = Symbol('SearchSimilar')
/**
 * An interface implemented by any object that can be vector searched.
 *
 * Implementation requires the following methods:
 * - [genEmbeddingSymbol](): Promise<Array<number>>
 *   - Generates a vector embedding for the object.
 * - [searchSimilarSymbol](): Promise<Array<Result>>
 *   - Searches for similar objects based on the vector embedding.
 *
 */
export interface VectorSearchable<Result> {
  [genEmbeddingSymbol](): Promise<Array<number>>
  [searchSimilarSymbol](): Promise<Array<Result>>
}
export async function vectorSearch<Result>(searchable: VectorSearchable<Result>) {
  const embedding = await searchable[genEmbeddingSymbol]()
}
