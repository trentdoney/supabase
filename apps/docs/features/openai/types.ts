/**
 * Adapted from [fumadocs](https://github.com/fuma-nama/fumadocs), available under the MIT license.
 *
 * View [original license](https://github.com/fuma-nama/fumadocs/blob/86824271800f53d1dea743e75e186c1a0b7ea433/LICENSE)
 */

// import type { OpenAPIV3_1 as V3_1 } from 'openapi-types'
// import type { default as Slugger } from 'github-slugger'
// import type { BuiltinTheme, CodeOptionsThemes, CodeToHastOptionsCommon } from 'shiki'

// export type Document = V3_1.Document
// export type OperationObject = V3_1.OperationObject
// export type ParameterObject = V3_1.ParameterObject
// export type SecurityRequirementObject = V3_1.SecurityRequirementObject
// export type SecuritySchemeObject = V3_1.SecuritySchemeObject
// export type ReferenceObject = V3_1.ReferenceObject
// export type PathItemObject = V3_1.PathItemObject
// export type TagObject = V3_1.TagObject
// export type ServerObject = NoReference<V3_1.ServerObject>
// export type CallbackObject = NoReference<V3_1.CallbackObject>

// export type MethodInformation = NoReference<OperationObject> & {
//   method: string
// }

// type Awaitable<T> = T | Promise<T>

// /**
//  * Dereferenced value and its original `$ref` value
//  */
// export type DereferenceMap = Map<unknown, string>

// export interface RenderContext {
//   /**
//    * The url of proxy to avoid CORS issues
//    */
//   proxyUrl?: string

//   renderer: Renderer

//   baseUrl: string
//   servers: ServerObject[]

//   slugger: Slugger

//   /**
//    * dereferenced schema
//    */
//   schema: ProcessedDocument

//   /**
//    * Generate TypeScript definitions from response schema.
//    *
//    * Pass `false` to disable it.
//    *
//    * @param endpoint - the API endpoint
//    * @param code - status code
//    */
//   generateTypeScriptSchema?: ((endpoint: EndpointSample, code: string) => Awaitable<string>) | false

//   /**
//    * Generate code samples for endpoint.
//    */
//   generateCodeSamples?: (endpoint: EndpointSample) => Awaitable<CodeSample[]>

//   shikiOptions?: Omit<CodeToHastOptionsCommon, 'lang'> & CodeOptionsThemes<BuiltinTheme>

//   /**
//    * Show full response schema instead of only example response & Typescript definitions
//    */
//   showResponseSchema?: boolean
// }
