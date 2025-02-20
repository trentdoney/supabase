import { cn } from 'ui'

import { ErrorMessage, Messages, SidePanelInput } from './SidePanel.client'

export function SidePanel({ className }: { className?: string } = {}) {
  return (
    <div
      className={cn(
        'w-full h-full overflow-hidden',
        'flex flex-col items-between',
        'p-4',
        className
      )}
    >
      <Messages className="w-full flex-grow overflow-x-hidden overflow-y-auto mb-4" />
      <ErrorMessage />
      <SidePanelInput />
    </div>
  )
}
