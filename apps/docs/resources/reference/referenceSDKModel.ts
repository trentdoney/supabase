import * as fs from 'fs/promises'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { Result } from '~/features/helpers.fn'
import { SPEC_DIRECTORY } from '~/lib/docs'
import { type SearchResultInterface } from '../globalSearch/globalSearchInterface'
import { SDK_LANGUAGE_SPECS, COMMON_CLIENT_LIBS_SECTIONS_FILE } from './referenceSDKConstants'

export const SDKLanguages: Record<string, { value: string; pathSection: string }> = {
  JAVASCRIPT: {
    value: 'JavaScript',
    pathSection: 'javascript',
  },
  SWIFT: {
    value: 'Swift',
    pathSection: 'swift',
  },
  DART: {
    value: 'Dart',
    pathSection: 'dart',
  },
  CSHARP: {
    value: 'C#',
    pathSection: 'csharp',
  },
  KOTLIN: {
    value: 'Kotlin',
    pathSection: 'kotlin',
  },
  PYTHON: {
    value: 'Python',
    pathSection: 'python',
  },
}

export const SDKLanguageValues = Object.values(SDKLanguages).map(({ value }) => value)

export class ReferenceSDKFunctionModel implements SearchResultInterface {
  public title?: string
  public href?: string
  public content?: string
  public language: string
  public methodName?: string

  constructor({
    title,
    href,
    content,
    language,
    methodName,
  }: {
    title?: string
    href?: string
    content?: string
    language: string
    methodName?: string
  }) {
    this.title = title
    this.href = href
    this.content = content
    this.methodName = methodName

    if (SDKLanguageValues.includes(language)) {
      this.language = language
    }
  }

  // New static method to read common sections
  static async readCommonSections(): Promise<Result<any[], Error>> {
    return Result.tryCatch(
      async () => {
        const commonFile = path.join(SPEC_DIRECTORY, COMMON_CLIENT_LIBS_SECTIONS_FILE)
        const content = await fs.readFile(commonFile, 'utf8')
        return JSON.parse(content)
      },
      (error) => new Error(`Failed to read common sections: ${error}`)
    )
  }
  
  static async mapFromId(): Promise<Result<{ [id: string]: { [lang: string]: string } }, Error>> {
    // Read common sections using the new method
    const commonSectionsResult = await ReferenceSDKFunctionModel.readCommonSections()
    if (!commonSectionsResult.isOk()) {
      return commonSectionsResult as Result<never, Error>
    }
    
    return Result.tryCatch(
      async () => {
        const commonSections = commonSectionsResult.unwrap()
        const functionIds = ReferenceSDKFunctionModel.extractFunctionIds(commonSections)
        
        // Read all language spec files in parallel
        const languageContents = await Promise.all(
          SDK_LANGUAGE_SPECS.map(spec => 
            fs.readFile(path.join(SPEC_DIRECTORY, spec.file), 'utf8')
          )
        )
        
        // Build mapping
        const mapping: { [id: string]: { [lang: string]: string } } = {}
        
        // Process all language specs
        SDK_LANGUAGE_SPECS.forEach((langSpec, index) => {
          const spec = yaml.load(languageContents[index]) as any
          
          if (spec.functions) {
            for (const func of spec.functions) {
              if (func.id && functionIds.has(func.id)) {
                if (!mapping[func.id]) mapping[func.id] = {}
                mapping[func.id][langSpec.key] = 
                  ReferenceSDKFunctionModel.extractMethodName(func, langSpec.key)
              }
            }
          }
        })
        
        return mapping
      },
      (error) => new Error(`Failed to build function mapping: ${error}`)
    )
  }

  // Helper function to extract function IDs recursively
  private static extractFunctionIds(sections: any[], ids = new Set<string>()): Set<string> {
    for (const section of sections) {
      if (section.type === 'function' && section.id) {
        ids.add(section.id)
      }
      if (section.items) {
        ReferenceSDKFunctionModel.extractFunctionIds(section.items, ids)
      }
    }
    return ids
  }

  // Helper function to extract method name based on language
  private static extractMethodName(func: any, lang: string): string {
    if (lang === 'js' && func.$ref) {
      // Extract from $ref: "@supabase/auth-js.GoTrueClient.signUp" -> "signUp"
      return func.$ref.split('.').pop() || func.id
    } else if (func.title) {
      // Extract from title: "sign_up()" -> "sign_up"
      return func.title.replace(/[()]/g, '').trim()
    }
    return func.id // fallback to ID
  }
}
