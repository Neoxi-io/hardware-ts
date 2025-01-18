import { BME280 } from '../bme280';

jest.mock('i2c-bus');

describe('BME280', () => {
  let bus: any;
  let bme280: BME280;

  beforeEach(() => {
    bus = {
      i2cWriteSync: jest.fn(),
      i2cReadSync: jest.fn((addr, length, buffer) => buffer.fill(0)),
    };
    bme280 = new BME280(bus, 0x76);
  });

  it('should initialize the sensor', async () => {
    await bme280.init();
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x76, 2, Buffer.from([0xf2, 0x01]));
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x76, 2, Buffer.from([0xf4, 0x27]));
    expect(bus.i2cWriteSync).toHaveBeenCalledWith(0x76, 2, Buffer.from([0xf5, 0xa0]));
  });

  it('should read temperature', async () => {
    const temperature = await bme280.readTemperature();
    expect(bus.i2cReadSync).toHaveBeenCalledWith(0x76, 3, expect.any(Buffer));
    expect(temperature).toBeCloseTo(0, 1);
  });

  it('should read pressure', async () => {
    const pressure = await bme280.readPressure();
    expect(bus.i2cReadSync).toHaveBeenCalledWith(0x76, 3, expect.any(Buffer));
    expect(pressure).toBeCloseTo(0, 1);
  });

  it('should read humidity', async () => {
    const humidity = await bme280.readHumidity();
    expect(bus.i2cReadSync).toHaveBeenCalledWith(0x76, 2, expect.any(Buffer));
    expect(humidity).toBeCloseTo(0, 1);
  });
});
