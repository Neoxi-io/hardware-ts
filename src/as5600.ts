import { I2CBus } from 'i2c-bus'
import debugFactory from 'debug'
import { MCP23017 } from './mcp23017'
import { IOExpander } from './utils/ioExpander'

interface Status {
  detected: boolean
  tooLow: boolean
  tooHigh: boolean
}

export class AS5600 {
  private bus: I2CBus
  private address: number
  private debug: debugFactory.Debugger
  private mcp23017: MCP23017
  private angleID: string
  private magnetStatusID: string
  private magnitudeID: string

  constructor(bus: I2CBus, address: number = 0x36, mcp23017: MCP23017, angleID: string, magnetStatusID: string, magnitudeID: string, debug: boolean = false) {
    this.debug = debugFactory('AS5600')

    this.bus = bus
    this.address = address
    this.mcp23017 = mcp23017
    this.angleID = angleID
    this.magnetStatusID = magnetStatusID
    this.magnitudeID = magnitudeID

    if (debug) {
      debugFactory.enable('AS5600')
    }

    this.debug('Initializing AS5600 with address %x, bus %d', address, bus)
  }

  async readRawAngle(): Promise<{ [key: string]: number }> {
    const buffer = Buffer.alloc(2)
    await this.bus.readI2cBlockSync(this.address, 0x0c, 2, buffer)
    const rawAngle = (buffer[0] << 8) | buffer[1]
    this.debug('Read raw angle: %d', rawAngle)
    return { [this.angleID]: rawAngle }
  }

  async readAngle(): Promise<{ [key: string]: number }> {
    const buffer = Buffer.alloc(2)
    await this.bus.readI2cBlockSync(this.address, 0x0e, 2, buffer)
    const angle = (buffer[0] << 8) | buffer[1]
    this.debug('Read angle: %d', angle)
    return { [this.angleID]: angle }
  }

  public async getStatus(): Promise<Status> {
    const rstat = await this.getRawStatus()
    const mh = (rstat >> 3) & 1
    const ml = (rstat >> 4) & 1
    const md = (rstat >> 5) & 1
    return {
      detected: Boolean(md),
      tooLow: Boolean(ml),
      tooHigh: Boolean(mh),
    }
  }

  public async changeDirectionPin(pin: IOExpander.PinNumber16, direction: boolean): Promise<void> {
    this.debug('Changing direction pin %d to %s', pin, direction ? 'HIGH' : 'LOW')
    await this.mcp23017.setPin(pin, direction)
  }

  private async getRawStatus(): Promise<number> {
    const buffer = Buffer.alloc(1)
    await this.bus.readI2cBlockSync(this.address, 0x0b, 1, buffer)
    return buffer[0]
  }
}
