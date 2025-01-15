import debugFactory from 'debug'
import { I2CBus } from 'i2c-bus'

const hex = (v: number) => v.toString(16).padStart(2, '0')
const bin = (v: number) => v.toString(2).padStart(16, '0')
debugFactory.formatters.h = (v: any) => (v.length ? Array.prototype.map.call(v, (b) => hex(b)).join(' ') : hex(v))
debugFactory.formatters.b = bin

const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

const START_CONVERSION = 0b1000000000000000
const MUX: Record<string, number> = {
  '0+1': 0b0000000000000000,
  '0+3': 0b0001000000000000,
  '1+3': 0b0010000000000000,
  '2+3': 0b0011000000000000,
  '0+GND': 0b0100000000000000,
  '1+GND': 0b0101000000000000,
  '2+GND': 0b0110000000000000,
  '3+GND': 0b0111000000000000,
}

const gains: Record<string, number> = {
  '2/3': 0b0000000000000000, // +/- 6.144V
  '1': 0b0000001000000000, // +/- 4.096V
  '2': 0b0000010000000000, // +/- 2.048V
  '4': 0b0000011000000000, // +/- 1.024V
  '8': 0b0000100000000000, // +/- 0.512V
  '16': 0b0000101000000000, // +/- 0.256V
}

export class ADS1115 {
  private bus: any
  private addr: number
  private delay: number
  private shift: number
  private _gain: number
  private debug: debugFactory.Debugger

  constructor(bus: I2CBus, addr = 0x48, delay = 10, shift = 0, debug: boolean = false) {
    this.debug = debugFactory('ADS1115')

    this.debug(`Initializing ADS1115 at 0x${addr.toString(16)}`)

    this.bus = bus
    this.addr = addr
    this.delay = delay
    this.shift = shift
    this._gain = gains['2/3']

    if (debug) {
      debugFactory.enable('ADS1115')
    }
  }

  get gain(): number {
    return this._gain
  }

  set gain(level: number | string) {
    if (level === 2 / 3) level = '2/3'
    this._gain = gains[level as string] || this._gain
  }

  private writeReg16(register: number, value: number) {
    const buff = Buffer.from([register & 3, value >> 8, value & 0xff])
    this.debug('write to 0x%h [%h]', this.addr, buff)
    return this.bus.i2cWrite(this.addr, 3, buff)
  }

  private async readReg16(register: number): Promise<number> {
    await this.bus.i2cWrite(this.addr, 1, Buffer.alloc(1, register))
    const buff = (await this.bus.i2cRead(this.addr, 2, Buffer.allocUnsafe(2))).buffer
    this.debug('read from register 0x%h [%h]', register, buff)
    return (buff[0] << 8) | buff[1]
  }

  private async readResults(): Promise<number> {
    return (await this.readReg16(0x00)) >> this.shift
  }

  private writeConfig(value: number) {
    this.debug('writeConfig 0b%b', value)
    return this.writeReg16(0b01, value)
  }

  async measure(mux: string): Promise<number> {
    const muxValue = MUX[mux]
    if (typeof muxValue === 'undefined') throw new Error('Invalid mux')

    const config = 0x0183 // No comparator | 1600 samples per second | single-shot mode
    await this.writeConfig(config | this._gain | muxValue | START_CONVERSION)
    await sleep(this.delay)
    return this.readResults()
  }

  writeLowThreshold(threshold: number) {
    return this.writeReg16(0b10, threshold << this.shift)
  }

  writeHiThreshold(threshold: number) {
    return this.writeReg16(0b11, threshold << this.shift)
  }

  static async open(busNum: number, addr = 0x48, provider = 'i2c-bus'): Promise<ADS1115> {
    const bus = await require(provider).openPromisified(busNum)
    return new ADS1115(bus, addr)
  }
}
