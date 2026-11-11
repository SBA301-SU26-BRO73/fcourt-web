import type { IMessage, StompConfig } from '@stomp/stompjs'
import { describe, expect, it, vi } from 'vitest'

import { createSlotSocket, type SlotSocketStatus } from './slot-socket'

function setup(courtIds = [1, 2]) {
  let config!: StompConfig
  const subscriptions = new Map<string, (message: IMessage) => void>()
  const client = {
    activate: vi.fn(),
    deactivate: vi.fn(),
    subscribe: vi.fn((destination: string, callback: (message: IMessage) => void) => {
      subscriptions.set(destination, callback)
    }),
  }
  const onChange = vi.fn()
  const onResync = vi.fn()
  const statuses: SlotSocketStatus[] = []
  const socket = createSlotSocket({
    url: 'ws://host/ws-fcourt',
    courtIds,
    onChange,
    onResync,
    onStatus: (status) => statuses.push(status),
    createClient: (c) => {
      config = c
      return client
    },
  })
  return { socket, config: () => config, client, subscriptions, onChange, onResync, statuses }
}

const frame = (body: string) => ({ body }) as IMessage

describe('slot socket', () => {
  it('connects to the brokerURL with auto reconnect and the Flutter heartbeat settings', () => {
    const { config, client } = setup()
    expect(client.activate).toHaveBeenCalledOnce()
    expect(config()).toMatchObject({
      brokerURL: 'ws://host/ws-fcourt',
      reconnectDelay: 3000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 10000,
    })
  })

  it('subscribes to every court topic on connect and resyncs over HTTP', () => {
    const { config, client, onResync, statuses } = setup()
    config().onConnect?.({} as never)
    expect(client.subscribe.mock.calls.map((call) => call[0])).toEqual([
      '/topic/court-slots/1',
      '/topic/court-slots/2',
    ])
    expect(onResync).toHaveBeenCalledTimes(1)
    expect(statuses).toEqual(['connecting', 'connected'])
  })

  it('resyncs again after a drop and reconnect (events may have been missed)', () => {
    const { config, client, onResync, statuses } = setup([1])
    config().onConnect?.({} as never)
    config().onWebSocketClose?.({} as never)
    expect(statuses.at(-1)).toBe('disconnected')
    config().onConnect?.({} as never)
    expect(onResync).toHaveBeenCalledTimes(2)
    expect(client.subscribe).toHaveBeenCalledTimes(2)
    expect(statuses.at(-1)).toBe('connected')
  })

  it('forwards valid events and ignores garbage', () => {
    const { config, subscriptions, onChange } = setup([1])
    config().onConnect?.({} as never)
    const handler = subscriptions.get('/topic/court-slots/1')!
    handler(frame('{"courtId":1,"date":"2030-01-01","type":"HOLD_CREATED"}'))
    handler(frame('{"courtId":9,"date":"2030-01-01"}'))
    handler(frame('garbage'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ courtId: 1, date: '2030-01-01', type: 'HOLD_CREATED' })
  })

  it('stops reporting after close and deactivates the client once', () => {
    const { socket, config, client, onChange, onResync, subscriptions } = setup([1])
    config().onConnect?.({} as never)
    const handler = subscriptions.get('/topic/court-slots/1')!
    socket.close()
    socket.close()
    expect(client.deactivate).toHaveBeenCalledTimes(1)
    handler(frame('{"courtId":1,"date":"2030-01-01"}'))
    config().onConnect?.({} as never)
    expect(onChange).not.toHaveBeenCalled()
    expect(onResync).toHaveBeenCalledTimes(1)
  })
})
