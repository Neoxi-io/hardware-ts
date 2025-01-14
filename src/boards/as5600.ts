import { I2CBus } from 'i2c-bus'
import debugFactory from 'debug'
import { MCP23017 } from './mcp23017'

interface Status {
  detected: boolean;
  tooLow: boolean;
  tooHigh: boolean;
}

export class AS5600 {
  private bus: I2CBus
  private address: number
  private debug: debugFactory.Debugger
  private mcp23017: MCP23017

  constructor(bus: I2CBus, address: number = 0x36, mcp23017: MCP23017, debug: boolean = false) {
    this.debug = debugFactory('AS5600')

    this.bus = bus
    this.address = address
    this.mcp23017 = mcp23017

    if (debug) {
      debugFactory.enable('AS5600')
    }

    this.debug('Initializing AS5600 with address %x, bus %d', address, bus)
  }

  async readRawAngle(): Promise<number> {
    const buffer = Buffer.alloc(2)
    await this.bus.readI2cBlock(this.address, 0x0C, 2, buffer)
    const rawAngle = (buffer[0] << 8) | buffer[1]
    this.debug('Read raw angle: %d', rawAngle)
    return rawAngle
  }

  async readAngle(): Promise<number> {
    const buffer = Buffer.alloc(2)
    await this.bus.readI2cBlock(this.address, 0x0E, 2, buffer)
    const angle = (buffer[0] << 8) | buffer[1]
    this.debug('Read angle: %d', angle)
    return angle
  }

  public async getStatus(): Promise<Status> {
    const rstat = await this.getRawStatus();
    const mh = (rstat >> 3) & 1;
    const ml = (rstat >> 4) & 1;
    const md = (rstat >> 5) & 1;
    return {
        detected: Boolean(md),
        tooLow: Boolean(ml),
        tooHigh: Boolean(mh),
    };
  }

  public async changeDirectionPin(pin: number, direction: boolean): Promise<void> {
    this.debug('Changing direction pin %d to %s', pin, direction ? 'HIGH' : 'LOW')
    await this.mcp23017.setPin(pin, direction)
  }

  private async getRawStatus(): Promise<number> {
    const buffer = Buffer.alloc(1)
    await this.bus.readI2cBlock(this.address, 0x0B, 1, buffer)
    return buffer[0]
  }
}
