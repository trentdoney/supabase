import { readdir, readFile } from 'node:fs/promises'
import { extname, join, sep } from 'node:path'
import {
  extractMessageFromAnyError,
  DataAccessError as FileAccessError,
  MultiError,
} from '~/app/api/utils'
import {
  TROUBLESHOOTING_DIRECTORY,
  TroubleshootingSchema,
} from '~/features/docs/Troubleshooting.utils.common.mjs'
import { Result } from '~/features/helpers.fn'
import { type SearchResultInterface } from '../globalSearch/globalSearchInterface'
import { extractFrontmatter } from '../utils/markdown'

export class TroubleshootingModel implements SearchResultInterface {
  public id?: string
  public title?: string
  public href?: string
  public content?: string
  public errorCodes?: Array<string>

  static async loadFromFile(path: string): Promise<Result<TroubleshootingModel, Error>> {
    return (
      await Result.tryCatch(
        async () => ({ path, content: await readFile(path, 'utf8') }),
        (error) => {
          return new FileAccessError(
            `Failed to load troubleshooting entry from file ${path}: ${extractMessageFromAnyError(error)}`,
            error
          )
        }
      )
    ).flatMap(({ path, content }) => {
      const slug = path.replace(TROUBLESHOOTING_DIRECTORY, '').replace(extname(path), '')
      const href = `https://supabase.com/docs/guides/troubleshooting/${slug}`
      return extractFrontmatter(content, 'toml', (data) => TroubleshootingSchema.parse(data)).map(
        ({ frontmatter, content }) =>
          new TroubleshootingModel({
            id: frontmatter.database_id,
            title: frontmatter.title,
            href,
            content,
            errorCodes: frontmatter.errors?.map((error) => error.code).filter(Boolean),
          })
      )
    })
  }

  static async loadAllFromRepo(): Promise<[Array<TroubleshootingModel>, MultiError]> {
    return (
      await Result.tryCatch(
        async () => await readdir(TROUBLESHOOTING_DIRECTORY, { recursive: true }),
        (error) => {
          return new FileAccessError(
            `Failed to load troubleshooting entries: ${extractMessageFromAnyError(error)}`,
            error
          )
        }
      )
    ).match(
      async (paths) => {
        const filteredPaths = paths
          .filter(
            (path) =>
              ['.mdx', '.md'].includes(extname(path)) &&
              !path.split(sep).some((part) => part.startsWith('_'))
          )
          .map((path) => join(TROUBLESHOOTING_DIRECTORY, path))
        return Result.splitArray(
          await Promise.all(
            filteredPaths.map(async (path) => {
              return TroubleshootingModel.loadFromFile(path)
            })
          )
        )
      },
      (error) => [[] as Array<TroubleshootingModel>, new MultiError(error.message, [error])]
    )
  }

  constructor({
    id,
    title,
    href,
    content,
    errorCodes,
  }: {
    id?: string
    title?: string
    href?: string
    content?: string
    errorCodes?: Array<string>
  }) {
    this.id = id
    this.title = title
    this.href = href
    this.content = content
    this.errorCodes = errorCodes
  }
}
