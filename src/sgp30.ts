import { I2CBus } from 'i2c-bus'
import { performance } from 'perf_hooks'
import debugFactory from 'debug'

function Wait(msecs: number): void {
  const start = performance.now()
  while (performance.now() - start < msecs);
}

class SGP30 {
  private bus: I2CBus
  private address: number
  private data: number[] = [0, 0, 0, 0, 0]
  private measureIAQInterval: NodeJS.Timeout | null = null
  private readonly debug: debugFactory.Debugger

  constructor(bus: I2CBus, address: number = 0x58, debug: boolean = false) {
    this.debug = debugFactory('SGP30')

    this.debug('Initializing SGP30 with address %x, bus %d', address, bus)

    this.bus = bus
    this.address = address

    if (debug) {
      debugFactory.enable('SGP30')
    }
  }

  identify(): boolean {
    this.debug('Identifying SGP30 sensor')
    this.bus.writeByteSync(this.address, 0x20, 0x2f)
    Wait(2)
    const productID = Buffer.alloc(3)
    this.bus.readI2cBlockSync(this.address, 0x00, 3, productID)
    if ((productID[0] & 0xf0) === 0x0) {
      this.debug('SGP30 sensor identified')
      return true
    } else {
      this.debug('SGP30 sensor not identified')
      return false
    }
  }

  isAvailable(): boolean {
    this.debug('Checking if SGP30 sensor is available')
    return this.address > 0
  }

  start(): void {
    this.debug('Starting SGP30 sensor')
    this.bus.writeByteSync(this.address, 0x20, 0x03)

    this.debug('Starting periodic measurements')
    this.measureIAQInterval = setInterval(this.periodicMeasurements.bind(this), 1000)
  }

  stop(): void {
    this.debug('Stopping SGP30 sensor')
    if (this.measureIAQInterval) {
      clearInterval(this.measureIAQInterval)
    }
  }

  setHumidity(humidity: number): void {
    // To be implemented
  }

  private periodicMeasurements(): void {
    if (!this.bus) return

    this.debug('Performing periodic measurements')

    this.bus.writeByteSync(this.address, 0x20, 0x08)
    Wait(13)
    const readBuf = Buffer.alloc(6)
    this.bus.readI2cBlockSync(this.address, 0x00, 6, readBuf)
    this.data[0] = (readBuf[3] << 8) + readBuf[4]
    this.data[1] = (readBuf[0] << 8) + readBuf[1]

    if (this.data[0] > 2200) this.data[4] = 5
    else if (this.data[0] > 660) this.data[4] = 4
    else if (this.data[0] > 220) this.data[4] = 3
    else if (this.data[0] > 65) this.data[4] = 2
    else this.data[4] = 1

    this.bus.writeByteSync(this.address, 0x20, 0x50)
    Wait(26)
    this.bus.readI2cBlockSync(this.address, 0x00, 6, readBuf)
    this.data[2] = Math.round((((readBuf[3] << 8) + readBuf[4]) * 1000) / 65536)
    this.data[3] = Math.round((((readBuf[0] << 8) + readBuf[1]) * 1000) / 65536)

    this.debug('Periodic measurements complete')
  }

  get(): {
    tvoc: number
    eco2: number
    ethanol: number
    hydrogen: number
    overall_air_quality: number
  } {
    this.debug('Getting SGP30 sensor data')
    return {
      tvoc: this.data[0],
      eco2: this.data[1],
      ethanol: this.data[2],
      hydrogen: this.data[3],
      overall_air_quality: this.data[4],
    }
  }
}

export default SGP30
