import { MCP23017 } from '../mcp23017';
import { I2CBus } from 'i2c-bus';

jest.mock('i2c-bus');

describe('MCP23017', () => {
  let bus: I2CBus;
  let mcp23017: MCP23017;

  beforeEach(() => {
    bus = {
      i2cWrite: jest.fn((addr, length, buffer) => Promise.resolve({ bytesWritten: length, buffer })),
      i2cRead: jest.fn((addr, length, buffer) => Promise.resolve({ bytesRead: length, buffer })),
      writeI2cBlock: jest.fn((addr, cmd, length, buffer) => Promise.resolve({ bytesWritten: length, buffer })),
      readI2cBlock: jest.fn((addr, cmd, length, buffer) => Promise.resolve({ bytesRead: length, buffer })),
    } as unknown as I2CBus;
    mcp23017 = new MCP23017(bus, 0x20);
  });

  it('should initialize the chip', async () => {
    const initialHardwareState = 0x00;
    await mcp23017['_initializeChip'](initialHardwareState);
    expect(bus.writeI2cBlock).toHaveBeenCalled();
  });

  it('should read state', async () => {
    const state = await mcp23017['_readState']();
    expect(bus.readI2cBlock).toHaveBeenCalled();
    expect(state).toBeDefined();
  });

  it('should write state', async () => {
    const state = 0xFF;
    await mcp23017['_writeState'](state);
    expect(bus.writeI2cBlock).toHaveBeenCalled();
  });

  it('should write direction', async () => {
    const inputPinBitmask = 0xFF;
    await mcp23017['_writeDirection'](inputPinBitmask);
    expect(bus.writeI2cBlock).toHaveBeenCalled();
  });

  it('should write interrupt control', async () => {
    const interruptBitmask = 0xFF;
    await mcp23017['_writeInterruptControl'](interruptBitmask);
    expect(bus.writeI2cBlock).toHaveBeenCalled();
  });
});
