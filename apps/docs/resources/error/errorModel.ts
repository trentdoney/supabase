import { allErrors } from '~/content/errorCodes'
import { IErrorArgs } from './errorSchema'

let cachedErrorMap = null as Map<string, SbError> | null

function getErrorMap() {
  if (!cachedErrorMap) {
    cachedErrorMap = new Map<string, SbError>()
    allErrors.forEach((error) => {
      const sbError = new SbError({
        code: error.code,
        service: error.service,
        statusCode: error.httpStatus,
      })
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

  constructor(args: IErrorArgs) {
    this.code = args.code
    this.service = args.service
    this.statusCode = args.statusCode
    this.id = SbError.genId({
      service: this.service,
      code: this.code,
    })
  }

  static genId({ service, code }: { service: string; code: string }) {
    return `${service}::${code}`
  }

  static find(args: IErrorArgs): SbError | undefined {
    const errorMap = getErrorMap()
    return errorMap.get(SbError.genId(args))
  }
}
