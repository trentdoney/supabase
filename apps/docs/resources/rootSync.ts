import '../scripts/utils/dotenv'

import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'
import { syncErrorCodes } from './error/errorSync'
import { syncTroubleshootingErrorRelationship } from './troubleshooting/troubleshootingSync'

async function sync(): Promise<void> {
  console.log(styleText('magenta', 'Starting sync to database...'))

  // In order for dependencies to resolve properly, sync occurs in two stages:
  // 1. Sync individual tables
  // 2. Sync relationships between tables
  const tableSyncResults = await Promise.all([syncErrorCodes()])
  const relationshipSyncResults = await Promise.all([syncTroubleshootingErrorRelationship()])

  const hasError =
    tableSyncResults.some((result) => !result.isOk()) ||
    relationshipSyncResults.some((result) => !result.isOk())

  if (hasError) {
    console.error(styleText('bold', styleText('red', 'Sync failed')))
    process.exit(1)
  } else {
    console.log(styleText('bold', styleText('green', 'Sync successful')))
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  sync()
}
