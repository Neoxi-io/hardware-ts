import { RelayModule, RelayConfig } from '../relayModule';
import { MCP23017 } from '../mcp23017';
import { IOExpander } from '../utils/ioExpander';

jest.mock('i2c-bus');

describe('RelayModule', () => {
  let gpio: MCP23017;
  let relayModule: RelayModule;

  beforeEach(() => {
    gpio = new MCP23017({} as any, 0x20);
    relayModule = new RelayModule('TestRelayModule', gpio);
  });

  it('should initialize a relay', () => {
    const relay = { pin: 0 as IOExpander.PinNumber16, config: RelayConfig.NO, state: false };
    relayModule.initRelay(relay);
    expect(relayModule.getRelayState(0)).toBe(false);
  });

  it('should turn on a relay', async () => {
    const relay = { pin: 0 as IOExpander.PinNumber16, config: RelayConfig.NO, state: false };
    relayModule.initRelay(relay);
    await relayModule.turnOnRelay(0);
    expect(gpio.setPin).toHaveBeenCalledWith(0, true);
    expect(relayModule.getRelayState(0)).toBe(true);
  });

  it('should turn off a relay', async () => {
    const relay = { pin: 0 as IOExpander.PinNumber16, config: RelayConfig.NO, state: true };
    relayModule.initRelay(relay);
    await relayModule.turnOffRelay(0);
    expect(gpio.setPin).toHaveBeenCalledWith(0, false);
    expect(relayModule.getRelayState(0)).toBe(false);
  });

  it('should not initialize more than 8 relays', () => {
    for (let i = 0; i < 8; i++) {
      relayModule.initRelay({ pin: i as IOExpander.PinNumber16, config: RelayConfig.NO, state: false });
    }
    relayModule.initRelay({ pin: 8 as IOExpander.PinNumber16, config: RelayConfig.NO, state: false });
    expect(relayModule.getRelayState(8)).toBe(false);
  });

  it('should not initialize the same relay twice', () => {
    const relay = { pin: 0 as IOExpander.PinNumber16, config: RelayConfig.NO, state: false };
    relayModule.initRelay(relay);
    relayModule.initRelay(relay);
    expect(relayModule.getRelayState(0)).toBe(false);
  });
});
