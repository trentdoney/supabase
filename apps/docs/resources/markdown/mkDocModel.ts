import { Result } from '~/resources/appError'
import { MarkdownModel } from './markdownModel'

export interface GitHubMetadata {
  org: string
  repo: string
  branch: string
  dir: string
  path: string
  remoteUrl?: string
}

interface PreloadedGitHubSource {
  content: string
  metadata: GitHubMetadata
}

interface RemoteGitHubSource {
  metadata: GitHubMetadata
}

export class MkDocModel<SearchResult> extends MarkdownModel<SearchResult> {
  private raw: string
  private metadata: GitHubMetadata
  private frontmatter: object
  private cachedDocsSiteCompatible: string | undefined

  constructor(raw: string, metadata: GitHubMetadata) {
    super()
    this.raw = raw
    this.metadata = metadata
  }

  static loadPreloadedGitHub(source: PreloadedGitHubSource) {
    return new MkDocModel(source.content, source.metadata)
  }

  static async loadRemoteGitHub(source: RemoteGitHubSource, customFetch: typeof fetch = fetch) {
    return Result.tryCatch(async () => {})
  }

  toDocsSiteCompatible() {
    if (!this.cachedDocsSiteCompatible) {
      this.cachedDocsSiteCompatible = this.raw
    }
    return this.cachedDocsSiteCompatible
  }

  genEditLink() {
    return ''
  }
}
