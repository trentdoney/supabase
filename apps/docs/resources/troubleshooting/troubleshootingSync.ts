import { Result } from '~/features/helpers.fn'
import { supabaseAdmin } from '~/lib/supabaseAdmin'
import { TaggedLogger } from '../utils/log'
import { TroubleshootingModel } from './troubleshootingModel'

export async function syncTroubleshootingErrorRelationship(): Promise<Result<void, Error>> {
  const logger = new TaggedLogger('Sync troubleshooting errors')

  logger.log('Starting sync of troubleshooting error relationships...')

  const [troubleshootingInstances, loadErrors] = await TroubleshootingModel.loadAllFromRepo()
  logger.log(`Loaded ${troubleshootingInstances.length} troubleshooting articles`)
  if (loadErrors) {
    logger.error(`Failed to load some troubleshooting articles: ${loadErrors.message}`)
  }

  const codesToSync = troubleshootingInstances
    .flatMap((troubleshooting) => {
      if (!troubleshooting.id || !troubleshooting.errorCodes) {
        return null
      }

      return troubleshooting.errorCodes.map((code) => ({
        troubleshootingId: troubleshooting.id,
        errorCode: code,
      }))
    })
    .filter(Boolean)

  const uploadResult = new Result(
    await supabaseAdmin()
      .schema('content')
      .rpc('sync_troubleshooting_error_relationship', { error_map: codesToSync })
  ).mapError((error) => {
    logger.error(`Failed to sync troubleshooting error relationships: ${error.message}`)
    return error
  })

  if (loadErrors || !uploadResult.isOk()) {
    return Result.error(loadErrors || uploadResult.unwrapError())
  }
  return Result.ok(undefined)
}
