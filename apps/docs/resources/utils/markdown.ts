import matter from 'gray-matter'
import { parse as parseToml } from 'smol-toml'
import { extractMessageFromAnyError } from '~/app/api/utils'
import { Result } from '~/features/helpers.fn'

/**
 * Extract frontmatter from raw Markdown file.
 */
export function extractFrontmatter<Validated>(
  markdown: string,
  format: 'toml' | 'yaml',
  validator: (data: unknown) => Validated
): Result<{ frontmatter: Validated; content: string }, Error>
export function extractFrontmatter(
  markdown: string,
  format: 'toml' | 'yaml'
): Result<{ frontmatter: Record<string, unknown>; content: string }, Error>
export function extractFrontmatter<Validated>(
  markdown: string,
  format: 'toml' | 'yaml',
  validator?: (data: unknown) => Validated
): Result<{ frontmatter: Validated | Record<string, unknown>; content: string }, Error> {
  return Result.tryCatchSync(
    () => {
      const options = format === 'toml' ? { language: 'toml', engines: { toml: parseToml } } : {}
      const { data, content } = matter(markdown, options)
      if (validator) {
        return { frontmatter: validator(data), content }
      } else {
        return { frontmatter: data, content }
      }
    },
    (error) =>
      new Error(`Error reading and validating frontmatter: ${extractMessageFromAnyError(error)}`, {
        cause: error,
      })
  )
}
