import { extname, sep } from 'node:path'

export const toGhCompatMethod = Symbol('GitHubCompatible')

export interface GitHubCompatible {
  [toGhCompatMethod](): string
}

export const toGenMdCompatMethod = Symbol('GenericMarkdownCompatible')

export interface GenericMarkdownCompatible {
  [toGenMdCompatMethod](): string
}

async function isIgnoredContent(dirEnt: string): boolean {
  // Ignore directories, take files only

  const ext = extname(dirEnt)
  if (ext !== 'md' && ext !== 'mdx') {
    return true
  }

  const parts = dirEnt.split(sep)
  return parts.some((part) => part.startsWith('_'))
}
