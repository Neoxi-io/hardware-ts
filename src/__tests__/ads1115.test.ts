import { ADS1115 } from '../ads1115';

jest.mock('i2c-bus');

describe('ADS1115', () => {
  let bus: any;
  let ads1115: ADS1115;

  beforeEach(() => {
    bus = {
      i2cWrite: jest.fn((addr, length, buffer) => Promise.resolve({ bytesWritten: length, buffer })),
      i2cRead: jest.fn((addr, length, buffer) => Promise.resolve({ bytesRead: length, buffer })),
    };
    ads1115 = new ADS1115(bus, 0x48);
  });

  it('should initialize with default values', () => {
    expect(ads1115.gain).toBe(0);
  });

  it('should set gain', () => {
    ads1115.gain = '1';
    expect(ads1115.gain).toBe(0b0000001000000000);
  });

  it('should write to register', async () => {
    await ads1115['writeReg16'](0x01, 0x1234);
    expect(bus.i2cWrite).toHaveBeenCalledWith(0x48, 3, Buffer.from([0x01, 0x12, 0x34]));
  });

  it('should read from register', async () => {
    bus.i2cRead.mockResolvedValueOnce({ bytesRead: 2, buffer: Buffer.from([0x12, 0x34]) });
    const value = await ads1115['readReg16'](0x01);
    expect(bus.i2cWrite).toHaveBeenCalledWith(0x48, 1, Buffer.alloc(1, 0x01));
    expect(value).toBe(0x1234);
  });

  it('should measure voltage', async () => {
    bus.i2cRead.mockResolvedValueOnce({ bytesRead: 2, buffer: Buffer.from([0x12, 0x34]) });
    const value = await ads1115.measure('0+GND');
    expect(bus.i2cWrite).toHaveBeenCalledWith(0x48, 3, expect.any(Buffer));
    expect(value).toBe(0x1234);
  });

  it('should write low threshold', async () => {
    await ads1115.writeLowThreshold(0x5678);
    expect(bus.i2cWrite).toHaveBeenCalledWith(0x48, 3, Buffer.from([0b10, 0x56, 0x78]));
  });

  it('should write high threshold', async () => {
    await ads1115.writeHiThreshold(0x9abc);
    expect(bus.i2cWrite).toHaveBeenCalledWith(0x48, 3, Buffer.from([0b11, 0x9a, 0xbc]));
  });
});
