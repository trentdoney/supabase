import { allErrors } from '~/content/errorCodes'
import { type ErrorCode } from '~/content/errorCodes/types'
import { type IErrorArgs } from './errorSchema'

let cachedErrorMap = null as Map<string, SbError> | null

function getErrorMap() {
  if (!cachedErrorMap) {
    cachedErrorMap = new Map<string, SbError>()
    allErrors.forEach((error) => {
      const sbError = new SbError(error)
      cachedErrorMap.set(sbError.id, sbError)
    })
  }
  return cachedErrorMap
}

export class SbError {
  id: string
  code: string
  service: string
  statusCode?: number
  message?: string

  constructor(data: ErrorCode) {
    this.code = data.code
    this.service = data.service
    this.statusCode = data.httpStatus
    this.message = data.message
    this.id = SbError.genId({
      service: this.service,
      code: this.code,
    })
  }

  static getAll() {
    return Array.from(getErrorMap().values())
  }

  static genId({ service, code }: { service: string; code: string }) {
    return `${service}::${code}`
  }

  static find(args: IErrorArgs): SbError | undefined {
    const errorMap = getErrorMap()
    return errorMap.get(SbError.genId(args))
  }
}
