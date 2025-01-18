import { AS5600 } from '../as5600';
import { MCP23017 } from '../mcp23017';

jest.mock('i2c-bus');

describe('AS5600', () => {
  let bus: any;
  let as5600: AS5600;
  let mcp23017: MCP23017;

  beforeEach(() => {
    bus = {
      readI2cBlockSync: jest.fn((addr, cmd, length, buffer) => buffer.fill(0)),
    };
    mcp23017 = new MCP23017(bus, 0x20);
    as5600 = new AS5600(bus, 0x36, mcp23017);
  });

  it('should read raw angle', async () => {
    const rawAngle = await as5600.readRawAngle();
    expect(bus.readI2cBlockSync).toHaveBeenCalledWith(0x36, 0x0c, 2, expect.any(Buffer));
    expect(rawAngle).toBe(0);
  });

  it('should read angle', async () => {
    const angle = await as5600.readAngle();
    expect(bus.readI2cBlockSync).toHaveBeenCalledWith(0x36, 0x0e, 2, expect.any(Buffer));
    expect(angle).toBe(0);
  });

  it('should get status', async () => {
    const status = await as5600.getStatus();
    expect(bus.readI2cBlockSync).toHaveBeenCalledWith(0x36, 0x0b, 1, expect.any(Buffer));
    expect(status).toEqual({
      detected: false,
      tooLow: false,
      tooHigh: false,
    });
  });

  it('should change direction pin', async () => {
    const pin = 0;
    const direction = true;
    await as5600.changeDirectionPin(pin, direction);
    expect(mcp23017.setPin).toHaveBeenCalledWith(pin, direction);
  });
});
