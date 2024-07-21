import debugFactory from 'debug'

const debug = debugFactory('VL53L1X - i2c')

export const i2c = (addr: number, bus: any) => {
  // i2c READ/WRITE functions
  const write = (data: any) => {
    debug('write [%h]', data)
    return bus.i2cWrite(addr, data.length, data)
  }
  const writeMulti = async (register: any, buffer: any) => {
    const buff = Buffer.allocUnsafe(buffer.length + 2)
    buffer.copy(buff, 2)
    buff[0] = (register >> 8) & 0xff
    buff[1] = register & 0xff
    await write(buff)
  }
  const writeReg = (register: any, value: any) => write(Buffer.from([(register >> 8) & 0xff, register & 0xff, value]))
  const writeReg16 = (register: any, value: any) => write(Buffer.from([(register >> 8) & 0xff, register & 0xff, value >> 8, value & 0xff]))
  const writeReg32 = (register: any, value: any) => write(Buffer.from([(register >> 8) & 0xff, register & 0xff, (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]))

  const readMulti = async (register: any, length = 1) => {
    await bus.i2cWrite(addr, 2, Buffer.from([(register >> 8) & 0xff, register & 0xff])) // tell it the read index
    const buff = (await bus.i2cRead(addr, length, Buffer.allocUnsafe(length))).buffer
    debug('read [%h] from 0x%h', buff, register)
    return buff
  }
  const readReg = async (register: any) => (await readMulti(register))[0]
  const readReg16 = async (register: any) => {
    const buff = await readMulti(register, 2)
    return buff.readUInt16BE(0)
  }
  const readReg32 = async (register: any) => {
    const buff = await readMulti(register, 4)
    return buff.readUInt32BE(0) //buff[0] << 24) | (buff[1] << 16) | (buff[2] <<  8) | buff[3]
  }

  return {
    write,
    writeMulti,
    writeReg,
    writeReg16,
    writeReg32,
    readMulti,
    readReg,
    readReg16,
    readReg32,
  }
}
