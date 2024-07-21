import debugFactory from 'debug'
import { MCP23017 } from './mcp23017'
import { IOExpander } from '../utils/ioExpander'

export enum RelayConfig {
  NO = 'NO',
  NC = 'NC',
}

export interface Relay {
  pin: IOExpander.PinNumber16
  config: RelayConfig
  state: boolean
}

export class RelayModule {
  private readonly debug: debugFactory.Debugger
  private gpioBoard: MCP23017
  private relays: Relay[] = []

  constructor(name: string, gpioBoard: MCP23017, debug: boolean = false) {
    this.debug = debugFactory(`RelayModule:${name}`)

    this.debug('Initializing RelayModule')

    this.gpioBoard = gpioBoard

    if (debug) {
      debugFactory.enable(`RelayModule:${name}`)
    }
  }

  initRelay(relay: Relay) {
    this.debug('Adding relay %d', relay.pin)

    if (this.relays.length >= 8) {
      this.debug('RelayModule can only have 8 relays')
      return
    }

    if (this.relays.find((r) => r.pin === relay.pin)) {
      this.debug('Relay %d already exists', relay.pin)
      return
    }

    if (relay.config === RelayConfig.NO) {
      this.debug('Setting relay %d as NO', relay.pin)
    }

    if (relay.config === RelayConfig.NC) {
      this.debug('Setting relay %d as NC', relay.pin)
    }

    this.relays.push(relay)
  }

  async turnOnRelay(pin: number) {
    const relay = this.relays.find((relay) => relay.pin === pin)

    if (!relay) {
      this.debug('Relay %d not found', pin)
      return
    }

    this.debug('Turning on relay %d', relay.pin)

    await this.gpioBoard.setPin(relay.pin, true)

    relay.state = true
  }

  async turnOffRelay(pin: number) {
    const relay = this.relays.find((relay) => relay.pin === pin)

    if (!relay) {
      this.debug('Relay %d not found', pin)
      return
    }

    this.debug('Turning off relay %d', relay.pin)

    await this.gpioBoard.setPin(relay.pin, false)

    relay.state = false
  }

  getRelayState(pin: number): boolean {
    const relay = this.relays.find((relay) => relay.pin === pin)

    if (!relay) {
      this.debug('Relay %d not found', pin)
      return false
    }

    return relay.state
  }
}
