import { DRV8825 } from '../drv8825';
import { MCP23017 } from '../mcp23017';
import PCA9685 from '../pca9685';
import { IOExpander } from '../utils/ioExpander';

jest.mock('i2c-bus');

describe('DRV8825', () => {
  let gpio: MCP23017;
  let pwm: PCA9685;
  let stepPin: IOExpander.PinNumber16;
  let dirPin: IOExpander.PinNumber16;
  let enablePin: IOExpander.PinNumber16;
  let drv8825: DRV8825;

  beforeEach(() => {
    gpio = new MCP23017({} as any, 0x20);
    pwm = new PCA9685(50, 1.0, 0x40, {} as any);
    stepPin = 0;
    dirPin = 1;
    enablePin = 2;
    drv8825 = new DRV8825(gpio, pwm, stepPin, dirPin, enablePin);
  });

  it('should set direction', async () => {
    await drv8825.setDirection(true);
    expect(gpio.setPin).toHaveBeenCalledWith(dirPin, true);
  });

  it('should enable the motor', async () => {
    await drv8825.enable();
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, false);
  });

  it('should disable the motor', async () => {
    await drv8825.disable();
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, true);
  });

  it('should move the motor', async () => {
    const steps = 10;
    const direction = true;
    const speed = 1000;

    await drv8825.move(steps, direction, speed);

    expect(gpio.setPin).toHaveBeenCalledWith(dirPin, direction);
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, false);
    expect(pwm.setPwm).toHaveBeenCalledTimes(steps * 2);
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, true);
  });
});
