import TCA9548A from '../tca9548a';
import { openPromisified } from 'i2c-bus';

jest.mock('i2c-bus');

describe('TCA9548A', () => {
  let bus: any;
  let tca9548a: TCA9548A;

  beforeAll(async () => {
    bus = await openPromisified(1);
    tca9548a = new TCA9548A(0x70, bus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should enable a single channel', () => {
    tca9548a.enableChannels(3);
    expect(bus.writeByteSync).toHaveBeenCalledWith(0x70, 0x00, 0x08);
  });

  test('should enable multiple channels', () => {
    tca9548a.enableChannels([1, 4, 6]);
    expect(bus.writeByteSync).toHaveBeenCalledWith(0x70, 0x00, 0x52);
  });

  test('should disable a single channel', () => {
    tca9548a.enableChannels([1, 4, 6]);
    tca9548a.disableChannels(4);
    expect(bus.writeByteSync).toHaveBeenCalledWith(0x70, 0x00, 0x12);
  });

  test('should disable multiple channels', () => {
    tca9548a.enableChannels([1, 4, 6]);
    tca9548a.disableChannels([1, 6]);
    expect(bus.writeByteSync).toHaveBeenCalledWith(0x70, 0x00, 0x10);
  });

  test('should enable all channels', () => {
    tca9548a.enableAll();
    expect(bus.writeByteSync).toHaveBeenCalledWith(0x70, 0x00, 0xff);
  });

  test('should disable all channels', () => {
    tca9548a.disableAll();
    expect(bus.writeByteSync).toHaveBeenCalledWith(0x70, 0x00, 0x00);
  });

  test('should list channels', () => {
    console.log = jest.fn();
    tca9548a.enableChannels([1, 4, 6]);
    tca9548a.listChannels();
    expect(console.log).toHaveBeenCalledWith('Channel 0: Disabled');
    expect(console.log).toHaveBeenCalledWith('Channel 1: Enabled');
    expect(console.log).toHaveBeenCalledWith('Channel 2: Disabled');
    expect(console.log).toHaveBeenCalledWith('Channel 3: Disabled');
    expect(console.log).toHaveBeenCalledWith('Channel 4: Enabled');
    expect(console.log).toHaveBeenCalledWith('Channel 5: Disabled');
    expect(console.log).toHaveBeenCalledWith('Channel 6: Enabled');
    expect(console.log).toHaveBeenCalledWith('Channel 7: Disabled');
  });
});
