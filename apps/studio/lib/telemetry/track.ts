import { TelemetryEvent, TelemetryGroups } from 'common/telemetry-constants'
import { useSendEventMutation } from 'data/telemetry/send-event-mutation'
import { useSelectedOrganizationQuery } from 'hooks/misc/useSelectedOrganization'
import { useSelectedProjectQuery } from 'hooks/misc/useSelectedProject'
import { useCallback } from 'react'

type EventMap = {
  [E in TelemetryEvent as E['action']]: E
}

type PropertiesForAction<A extends keyof EventMap> = EventMap[A] extends { properties: infer P }
  ? P
  : never

type HasProperties<A extends keyof EventMap> = EventMap[A] extends { properties: any }
  ? true
  : false

/**
 * Hook for type-safe telemetry event tracking with automatic project/org context injection.
 *
 * @example
 * const track = useTrack()
 * track('table_created', { method: 'sql_editor', schema_name: 'public' })
 * track('help_button_clicked')
 */
export const useTrack = () => {
  const { data: project } = useSelectedProjectQuery()
  const { data: org } = useSelectedOrganizationQuery()
  const { mutate: sendEvent } = useSendEventMutation()

  const track = useCallback(
    <A extends keyof EventMap>(
      action: A,
      ...args: HasProperties<A> extends true
        ? [properties: PropertiesForAction<A>, groupOverrides?: Partial<TelemetryGroups>]
        : [properties?: undefined, groupOverrides?: Partial<TelemetryGroups>]
    ) => {
      const [properties, groupOverrides] = args

      const groups = {
        ...(project?.ref && { project: project.ref }),
        ...(org?.slug && { organization: org.slug }),
        ...groupOverrides,
      }

      const event = {
        action,
        ...(properties && { properties }),
        ...(groups && { groups }),
      } as EventMap[A]

      sendEvent(event)
    },
    [project?.ref, org?.slug, sendEvent]
  )

  return track
}
