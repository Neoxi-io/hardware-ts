import SHT4X from '../sht4x';
import polycrc from 'polycrc';

jest.mock('i2c-bus');
jest.mock('polycrc');

describe('SHT4X', () => {
  let bus: any;
  let sht4x: SHT4X;

  beforeEach(() => {
    bus = {
      i2cWriteSync: jest.fn(),
      i2cReadSync: jest.fn((addr, length, buffer) => buffer.fill(0)),
    };
    sht4x = new SHT4X(bus, 0x44);
  });

  it('should initialize the sensor', async () => {
    await sht4x.init();
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x44, 1, Buffer.from([0x94]));
  });

  it('should read serial number', async () => {
    const serial = await sht4x.serialNumber();
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x44, 1, Buffer.from([0x89]));
    expect(bus.i2cReadSync).toHaveBeenCalledWith(0x44, 6, expect.any(Buffer));
    expect(serial).toBe(0);
  });

  it('should read temperature', async () => {
    const temperature = await sht4x.temperature();
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x44, 1, Buffer.from([0xfd]));
    expect(bus.i2cReadSync).toHaveBeenCalledWith(0x44, 6, expect.any(Buffer));
    expect(temperature).toBeCloseTo(-45, 1);
  });

  it('should read humidity', async () => {
    const humidity = await sht4x.relativeHumidity();
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x44, 1, Buffer.from([0xfd]));
    expect(bus.i2cReadSync).toHaveBeenCalledWith(0x44, 6, expect.any(Buffer));
    expect(humidity).toBeCloseTo(0, 1);
  });
});
