import { I2CBus } from 'i2c-bus'
import polycrc from 'polycrc'
import debugFactory from 'debug'

const sleep = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration)
  })

const crc8 = polycrc.crc(8, 0x31, 0xff, 0x00, false)

const _SHT4X_DEFAULT_ADDR = 0x44 // SHT4X I2C Address
const _SHT4X_READSERIAL = [0x89] // Read Out of Serial Register
const _SHT4X_SOFTRESET = [0x94] // Soft Reset

const MODES: { [key: string]: { command: number[]; description: string; readTime: number } } = {
  NOHEAT_HIGHPRECISION: { command: [0xfd], description: 'No heater, high precision', readTime: 10 },
  NOHEAT_MEDPRECISION: { command: [0xf6], description: 'No heater, med precision', readTime: 5 },
  NOHEAT_LOWPRECISION: { command: [0xe0], description: 'No heater, low precision', readTime: 2 },
  HIGHHEAT_1S: { command: [0x39], description: 'High heat, 1 second', readTime: 1110 },
  HIGHHEAT_100MS: { command: [0x32], description: 'High heat, 0.1 second', readTime: 110 },
  MEDHEAT_1S: { command: [0x2f], description: 'Med heat, 1 second', readTime: 1110 },
  MEDHEAT_100MS: { command: [0x24], description: 'Med heat, 0.1 seconds', readTime: 110 },
  LOWHEAT_1S: { command: [0x1e], description: 'Low heat, 1 second', readTime: 1110 },
  LOWHEAT_100MS: { command: [0x15], description: 'Low heat, 0.1 second', readTime: 110 },
}

export default class SHT4X {
  private readonly bus: I2CBus
  private readonly address: number
  private debug: debugFactory.Debugger
  private mode: string
  private tempID: string
  private humidityID: string

  constructor(bus: I2CBus, address = _SHT4X_DEFAULT_ADDR, tempID: string, humidityID: string, debug: boolean = false) {
    this.debug = debugFactory('SHT4X')

    this.debug('Initializing SHT4X with address %x, bus %d', address, bus)

    this.bus = bus
    this.address = address
    this.mode = 'NOHEAT_HIGHPRECISION'
    this.tempID = tempID
    this.humidityID = humidityID

    if (debug) {
      debugFactory.enable('SHT4X')
    }
  }

  async open(bus: I2CBus) {
    this.debug('Opening SHT4X sensor on bus %d', bus)
    this.init()
  }

  async init() {
    this.debug('Initializing SHT4X sensor')
    await this.reset()
  }

  async serialNumber() {
    this.debug('Reading SHT4X serial number')
    const writeBuffer = Buffer.from(_SHT4X_READSERIAL)
    await this.bus.i2cWriteSync(this.address, writeBuffer.length, writeBuffer)
    await sleep(10)
    const readBuffer = Buffer.alloc(6)
    await this.bus.i2cReadSync(this.address, readBuffer.length, readBuffer)
    const ser1 = readBuffer.subarray(0, 2)
    const ser1CRC = readBuffer.subarray(2)
    if (crc8(ser1) !== ser1CRC[0]) this.debug("Serial CRC Doesn't Match")
    const ser2 = readBuffer.subarray(3, 5)
    const ser2CRC = readBuffer.subarray(5)
    if (crc8(ser2) !== ser2CRC[0]) this.debug("Serial CRC Doesn't Match")
    const serial = (ser1[0] << 24) | (ser1[1] << 16) | (ser2[0] << 8) | ser2[1]
    this.debug('Serial number: %d', serial)
    return serial
  }

  async reset() {
    this.debug('Resetting SHT4X sensor')
    const writeBuffer = Buffer.from(_SHT4X_SOFTRESET)
    await this.bus.i2cWriteSync(this.address, writeBuffer.length, writeBuffer)
    await sleep(1)
  }

  setMode(modeSpecified: string) {
    this.debug('Setting SHT4X mode to %s', modeSpecified)
    if (!MODES[modeSpecified]) return
    this.mode = modeSpecified
  }

  async relativeHumidity() {
    this.debug('Reading SHT4X relative humidity')
    const measurement = await this.measurements()
    return measurement[this.humidityID]
  }

  async temperature() {
    this.debug('Reading SHT4X temperature')
    const measurement = await this.measurements()
    return measurement[this.tempID]
  }

  async measurements() {
    this.debug('Reading SHT4X measurements')
    const modeData = MODES[this.mode]
    const writeBuffer = Buffer.from(modeData.command)
    await this.bus.i2cWriteSync(this.address, writeBuffer.length, writeBuffer)
    await sleep(modeData.readTime)
    const readBuffer = Buffer.alloc(6)
    await this.bus.i2cReadSync(this.address, readBuffer.length, readBuffer)

    const tempData = readBuffer.subarray(0, 2)
    const tempCRC = readBuffer.subarray(2)
    if (crc8(tempData) !== tempCRC[0]) throw new Error("Temp CRC Doesn't Match")

    const humidityData = readBuffer.subarray(3, 5)
    const humidityCRC = readBuffer.subarray(5)
    if (crc8(humidityData) !== humidityCRC[0]) throw new Error("Humidity CRC Doesn't Match")

    // decode data into human values
    // convert bytes into 16 - bit signed integer
    let temperature = tempData.readUInt16BE(0)
    let temperature_c = -45.0 + (175.0 * temperature) / 65535.0

    // repeat above steps for humidity data
    let humidity = humidityData.readUInt16BE(0)
    // let humidity = (readBuffer[3] << 8) | readBuffer[4];
    humidity = -6.0 + (125.0 * humidity) / 65535.0
    humidity = Math.max(Math.min(humidity, 100), 0)

    return {
      [this.humidityID]: humidity,
      [this.tempID]: temperature_c,
    }
  }
}
