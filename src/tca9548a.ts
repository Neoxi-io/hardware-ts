import i2c, { I2CBus } from 'i2c-bus'
import debugFactory from 'debug'

export default class TCA9548A {
  private readonly address: number
  private readonly bus: i2c.I2CBus
  private readonly availableChannels: number[]
  private channelState: number
  private debug: debugFactory.Debugger

  constructor(address = 0x70, bus: I2CBus, debug: boolean = false) {
    this.debug = debugFactory('TCA9548A')

    this.debug('Initializing TCA9548A with address %x, bus %d', address, bus)

    this.address = address
    this.bus = bus
    this.availableChannels = [0, 1, 2, 3, 4, 5, 6, 7]
    this.channelState = 0x00

    if (debug) {
      debugFactory.enable('TCA9548A')
    }
  }

  enableChannels(enable: number | number[]) {
    if (!Array.isArray(enable)) {
      enable = [enable]
    }

    enable.forEach((entry) => {
      if (typeof entry !== 'number') {
        this.debug('TypeError: Entries must be integers.')
      } else if (entry < 0 || entry > 7) {
        this.debug('Entries must be in range of available channels (0-7).')
      } else {
        this.debug('Enabling channel %d', entry)
        this.channelState = this.channelState | (1 << entry)
      }
    })

    this.bus.writeByteSync(this.address, 0x00, this.channelState)
  }

  disableChannels(disable: number | number[]) {
    if (!Array.isArray(disable)) {
      disable = [disable]
    }

    disable.forEach((entry) => {
      if (typeof entry !== 'number') {
        this.debug('TypeError: Entries must be integers.')
      } else if (entry < 0 || entry > 7) {
        this.debug('Entries must be in range of available channels (0-7).')
      } else {
        this.debug('Disabling channel %d', entry)
        this.channelState = this.channelState & ~(1 << entry)
      }
    })

    this.bus.writeByteSync(this.address, 0x00, this.channelState)
  }

  enableAll() {
    this.debug('Enabling all channels')
    this.channelState = 0xff
    this.bus.writeByteSync(this.address, 0x00, this.channelState)
  }

  disableAll() {
    this.debug('Disabling all channels')
    this.channelState = 0x00
    this.bus.writeByteSync(this.address, 0x00, this.channelState)
  }

  listChannels() {
    let enabledChannels = this.channelState
    this.availableChannels.forEach((x) => {
      if ((enabledChannels & (1 << x)) >> x === 0) {
        this.debug(`Channel ${x}: Disabled`)
      } else if ((enabledChannels & (1 << x)) >> x === 1) {
        this.debug(`Channel ${x}: Enabled`)
      } else {
        this.debug('Error: Channel state is invalid.')
      }
    })
  }
}
