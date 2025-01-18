const mockI2CBus: {
  i2cWrite: jest.Mock<Promise<{ bytesWritten: number; buffer: Buffer }>, [number, number, Buffer]>;
  i2cRead: jest.Mock<Promise<{ bytesRead: number; buffer: Buffer }>, [number, number, Buffer]>;
  readI2cBlockSync: jest.Mock<Buffer, [number, number, number, Buffer]>;
  writeI2cBlockSync: jest.Mock<number, [number, number, number, Buffer]>;
  writeByteSync: jest.Mock<void, [number, number, number]>;
  readByteSync: jest.Mock<number, [number, number]>;
  openPromisified: jest.Mock<Promise<typeof mockI2CBus>, []>;
  readByte: jest.Mock<Promise<number>, [number, number]>;
  writeI2cBlock: jest.Mock<Promise<{ bytesWritten: number; buffer: Buffer }>, [number, number, number, Buffer]>;
  readI2cBlock: jest.Mock<Promise<{ bytesRead: number; buffer: Buffer }>, [number, number, number, Buffer]>;
  writeByte: jest.Mock<Promise<void>, [number, number, number]>;
} = {
  i2cWrite: jest.fn((addr, length, buffer) => Promise.resolve({ bytesWritten: length, buffer })),
  i2cRead: jest.fn((addr, length, buffer) => Promise.resolve({ bytesRead: length, buffer })),
  readI2cBlockSync: jest.fn((addr, cmd, length, buffer) => buffer.fill(0)),
  writeI2cBlockSync: jest.fn((addr, cmd, length, buffer) => buffer.length),
  writeByteSync: jest.fn((addr, cmd, byte) => {}),
  readByteSync: jest.fn((addr, cmd) => 0),
  openPromisified: jest.fn(() => Promise.resolve(mockI2CBus)),
  readByte: jest.fn((addr, cmd) => Promise.resolve(0)),
  writeI2cBlock: jest.fn((addr, cmd, length, buffer) => Promise.resolve({ bytesWritten: length, buffer })),
  readI2cBlock: jest.fn((addr, cmd, length, buffer) => Promise.resolve({ bytesRead: length, buffer })),
  writeByte: jest.fn((addr, cmd, byte) => Promise.resolve()),
};

module.exports = {
  openPromisified: jest.fn(() => Promise.resolve(mockI2CBus)),
};
