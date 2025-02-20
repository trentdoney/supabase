import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'

import { Admonition } from 'ui-patterns/Admonition'
import { AssistantChatForm } from 'ui-patterns/AssistantChat'

import { AutocompletePopover } from '../AutocompleteInput'
import { type HistoryItemApi, type HistoryItemUser, sidePanelState } from './SidePanel.utils'
import { cn } from 'ui'

function useReturnFocus<T extends HTMLElement>(ref: MutableRefObject<T>) {
  const previousFocusedElem = useRef<Element>(null)

  useEffect(() => {
    previousFocusedElem.current = document.activeElement
    ref.current?.focus()

    //@ts-expect-error -- focus will not be a method if not HTMLElement
    return () => previousFocusedElem.current?.focus?.()
  }, [ref])
}

export function SidePanelInput() {
  const { slashCommands, setCommand } = useSnapshot(sidePanelState)
  const slashCommandNames = useMemo(() => [...slashCommands.keys()], [slashCommands])

  const [commandsOpen, setCommandsOpen] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  useReturnFocus(textAreaRef)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const command = textAreaRef.current?.value
    if (command) setCommand(command)
    setValue('')
  }

  return (
    <div className="flex flex-col gap-3">
      <AutocompletePopover
        open={commandsOpen}
        setOpen={setCommandsOpen}
        textAreaRef={textAreaRef}
        value={value}
        setValue={setValue}
        suggestions={[{ name: 'ref js', hint: '[method]' }]}
      >
        <AssistantChatForm
          textAreaRef={textAreaRef}
          value={value}
          loading={loading}
          disabled={loading}
          onValueChange={(e) => setValue(e.target.value)}
          commandsOpen={commandsOpen}
          setCommandsOpen={setCommandsOpen}
          onSubmit={async (event) => {
            event.preventDefault()
            handleSubmit(event)
          }}
        />
      </AutocompletePopover>
      <p className="text-xs mt-3 text-foreground-lighter">
        Press <span className="bg-surface-300 px-[3px] py-[2px] border rounded">/</span> to open
        commands
      </p>
    </div>
  )
}

export function Messages({ className }: { className?: string }) {
  const { history } = useSnapshot(sidePanelState)
  const messagesContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight
    }
  })

  return (
    <div ref={messagesContainer} className={className}>
      {history.map((message) =>
        message.__agent == 'user' ? (
          <UserMessage message={message} />
        ) : (
          <ServerMessage message={message} />
        )
      )}
    </div>
  )
}

function UserMessage({ message }: { message: HistoryItemUser }) {
  return (
    <div
      className={cn(
        'text-sm bg-surface-200 px-4 py-2 rounded-3xl',
        'w-fit max-w-[80%]',
        'float-right',
        'mb-4'
      )}
    >
      <pre>{`/${message.command}`}</pre>
    </div>
  )
}

function ServerMessage({ message }: { message: HistoryItemApi }) {
  return (
    <div
      className={cn(
        'text-sm bg-dash-canvas px-4 py-2 rounded-3xl',
        'w-fit max-w-[80%] overflow-x-auto',
        'mb-4'
      )}
    >
      <pre>{JSON.stringify(message.response, null, 2)}</pre>
    </div>
  )
}

export function ErrorMessage() {
  const { error } = useSnapshot(sidePanelState)
  if (!error) return undefined

  return <Admonition type="warning">{error.toString()}</Admonition>
}
