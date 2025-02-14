import SGP30 from '../sgp30';
import { openPromisified } from 'i2c-bus';

jest.mock('i2c-bus');

describe('SGP30', () => {
  let mockBus: any;
  let sgp30: SGP30;

  beforeEach(async () => {
    mockBus = await openPromisified(1);
    sgp30 = new SGP30(mockBus, 0x58, true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should identify the sensor', () => {
    mockBus.readI2cBlockSync.mockReturnValue(Buffer.from([0x00, 0x00, 0x00]));
    expect(sgp30.identify()).toBe(true);
  });

  it('should start the sensor', () => {
    sgp30.start();
    expect(mockBus.writeByteSync).toHaveBeenCalledWith(0x58, 0x20, 0x03);
    sgp30.stop()
  });

  it('should stop the sensor', () => {
    sgp30.start();
    sgp30.stop();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('should get sensor data', () => {
    mockBus.readI2cBlockSync.mockReturnValue(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    sgp30.start();
    const data = sgp30.get();
    sgp30.stop()
    expect(data).toEqual({
      tvoc: 0,
      eco2: 0,
      ethanol: 0,
      hydrogen: 0,
      overall_air_quality: 1,
    });
  });
});
