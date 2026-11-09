import { Client, type IFrame, type IMessage, type StompConfig } from '@stomp/stompjs'

import type { CourtSlotChange } from '@/types/hold'

import { parseSlotChange, slotTopic } from './slot-events'

export type SlotSocketStatus = 'connecting' | 'connected' | 'disconnected'

export interface SlotSocketClient {
  activate: () => void
  deactivate: () => unknown
  subscribe: (destination: string, callback: (message: IMessage) => void) => unknown
}

export interface SlotSocketOptions {
  url: string
  courtIds: number[]
  /** A valid change event for one of the courts. */
  onChange: (change: CourtSlotChange) => void
  /** Fired after every (re)connect: events may have been missed, so refetch over HTTP. */
  onResync: () => void
  onStatus?: (status: SlotSocketStatus) => void
  /** Test seam. */
  createClient?: (config: StompConfig) => SlotSocketClient
}

export const RECONNECT_DELAY_MS = 3_000

/**
 * STOMP client for the public slot invalidation topics (booking-service `/ws-fcourt`, simple
 * broker `/topic/court-slots/{courtId}`). stompjs reconnects by itself; every connect (first or
 * later) subscribes again and asks the caller to resync, because the broker does not replay.
 */
export function createSlotSocket(options: SlotSocketOptions) {
  let closed = false
  const setStatus = (status: SlotSocketStatus) => {
    if (!closed) options.onStatus?.(status)
  }

  const config: StompConfig = {
    brokerURL: options.url,
    reconnectDelay: RECONNECT_DELAY_MS,
    connectionTimeout: 5_000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 10_000,
    onConnect: () => {
      if (closed) return
      for (const courtId of options.courtIds) {
        client.subscribe(slotTopic(courtId), (message: IMessage) => {
          const change = parseSlotChange(message.body, courtId)
          if (!closed && change) options.onChange(change)
        })
      }
      setStatus('connected')
      options.onResync()
    },
    onDisconnect: () => setStatus('disconnected'),
    onWebSocketClose: () => setStatus('disconnected'),
    onWebSocketError: () => setStatus('disconnected'),
    onStompError: (frame: IFrame) => {
      console.warn('Slot socket STOMP error', frame.headers?.message)
    },
  }

  const client = (options.createClient ?? ((c) => new Client(c)))(config)
  setStatus('connecting')
  client.activate()

  return {
    close() {
      if (closed) return
      closed = true
      void client.deactivate()
    },
  }
}
