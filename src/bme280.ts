import { I2CBus } from 'i2c-bus'
import debugFactory from 'debug'

export class BME280 {
  private bus: I2CBus
  private address: number
  private debug: debugFactory.Debugger

  private dig_T1: number
  private dig_T2: number
  private dig_T3: number
  private t_fine: number
  private dig_P1: number
  private dig_P2: number
  private dig_P3: number
  private dig_P4: number
  private dig_P5: number
  private dig_P6: number
  private dig_P7: number
  private dig_P8: number
  private dig_P9: number
  private dig_H1: number
  private dig_H2: number
  private dig_H3: number
  private dig_H4: number
  private dig_H5: number
  private dig_H6: number

  constructor(bus: I2CBus, address: number = 0x76, debug: boolean = false) {
    this.debug = debugFactory('BME280')

    this.debug('Initializing BME280 with address %x, bus %d', address, bus)

    this.bus = bus
    this.address = address

    if (debug) {
      debugFactory.enable('BME280')
    }

    this.dig_T1 = 0
    this.dig_T2 = 0
    this.dig_T3 = 0
    this.t_fine = 0
    this.dig_P1 = 0
    this.dig_P2 = 0
    this.dig_P3 = 0
    this.dig_P4 = 0
    this.dig_P5 = 0
    this.dig_P6 = 0
    this.dig_P7 = 0
    this.dig_P8 = 0
    this.dig_P9 = 0
    this.dig_H1 = 0
    this.dig_H2 = 0
    this.dig_H3 = 0
    this.dig_H4 = 0
    this.dig_H5 = 0
    this.dig_H6 = 0
  }

  async init() {
    this.debug('Initializing BME280 sensor')
    await this.writeRegister(0xf2, 0x01) // Humidity oversampling x1
    await this.writeRegister(0xf4, 0x27) // Pressure and temperature oversampling x1, mode normal
    await this.writeRegister(0xf5, 0xa0) // Standby time 1000ms, filter off

    const calib = await this.readRegisters(0x88, 26)
    this.dig_T1 = calib.readUInt16LE(0)
    this.dig_T2 = calib.readInt16LE(2)
    this.dig_T3 = calib.readInt16LE(4)
    this.dig_P1 = calib.readUInt16LE(6)
    this.dig_P2 = calib.readInt16LE(8)
    this.dig_P3 = calib.readInt16LE(10)
    this.dig_P4 = calib.readInt16LE(12)
    this.dig_P5 = calib.readInt16LE(14)
    this.dig_P6 = calib.readInt16LE(16)
    this.dig_P7 = calib.readInt16LE(18)
    this.dig_P8 = calib.readInt16LE(20)
    this.dig_P9 = calib.readInt16LE(22)
    this.dig_H1 = calib.readUInt8(25)

    const calib2 = await this.readRegisters(0xe1, 7)
    this.dig_H2 = calib2.readInt16LE(0)
    this.dig_H3 = calib2.readUInt8(2)
    this.dig_H4 = (calib2.readInt8(3) << 4) | (calib2.readUInt8(4) & 0x0f)
    this.dig_H5 = (calib2.readInt8(5) << 4) | (calib2.readUInt8(4) >> 4)
    this.dig_H6 = calib2.readInt8(6)
  }

  async readTemperature(): Promise<number> {
    this.debug('Reading temperature from BME280 sensor')
    const data = await this.readRegisters(0xfa, 3)
    const adc_T = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
    const var1 = (((adc_T >> 3) - (this.dig_T1 << 1)) * this.dig_T2) >> 11
    const var2 = (((((adc_T >> 4) - this.dig_T1) * ((adc_T >> 4) - this.dig_T1)) >> 12) * this.dig_T3) >> 14
    this.t_fine = var1 + var2
    const T = (this.t_fine * 5 + 128) >> 8
    return T / 100
  }

  async readPressure(): Promise<number> {
    this.debug('Reading pressure from BME280 sensor')
    const data = await this.readRegisters(0xf7, 3)
    const adc_P = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
    const var1 = (this.t_fine >> 1) - 64000
    const var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * this.dig_P6
    const var3 = (var1 * this.dig_P5) << 1
    const var4 = (var2 + var3) >> 2
    const var5 = (this.dig_P4 << 16) + var4
    const var6 = (((this.dig_P3 * ((var1 >> 2) * (var1 >> 2))) >> 13) >> 3) + ((this.dig_P2 * var1) >> 1)
    const var7 = (1048576 - adc_P - (var6 >> 12)) * 3125
    const var8 = (var7 << 1) / this.dig_P1
    const var9 = ((this.dig_P9 * ((var8 >> 3) * (var8 >> 3))) >> 13) >> 12
    const var10 = ((var8 >> 2) * this.dig_P8) >> 13
    const P = var8 + ((var9 + var10 + this.dig_P7) >> 4)
    return P / 100
  }

  async readHumidity(): Promise<number> {
    this.debug('Reading humidity from BME280 sensor')
    const data = await this.readRegisters(0xfd, 2)
    const adc_H = (data[0] << 8) | data[1]
    const var1 = this.t_fine - 76800
    const var2 = (adc_H << 14) - (this.dig_H4 << 20) - this.dig_H5 * var1 + 16384
    const var3 = var2 * (((((((var1 * this.dig_H6) >> 10) * (((var1 * this.dig_H3) >> 11) + 32768)) >> 10) + 2097152) * this.dig_H2 + 8192) >> 14)
    const var4 = var3 - (((((var3 >> 15) * (var3 >> 15)) >> 7) * this.dig_H1) >> 4)
    const H = (var4 < 0 ? 0 : var4 > 419430400 ? 419430400 : var4) >> 12
    return H / 1024
  }

  private async writeRegister(register: number, value: number) {
    const buffer = Buffer.from([register, value])
    await this.bus.i2cWriteSync(this.address, buffer.length, buffer)
  }

  private async readRegisters(register: number, length: number): Promise<Buffer> {
    const buffer = Buffer.alloc(length)
    await this.bus.i2cReadSync(this.address, length, buffer)
    return buffer
  }
}
