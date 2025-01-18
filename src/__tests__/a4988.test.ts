import { A4988 } from '../a4988';
import { MCP23017 } from '../mcp23017';
import PCA9685 from '../pca9685';
import { IOExpander } from '../utils/ioExpander';

jest.mock('i2c-bus');

describe('A4988', () => {
  let gpio: MCP23017;
  let pwm: PCA9685;
  let stepPin: IOExpander.PinNumber16;
  let dirPin: IOExpander.PinNumber16;
  let enablePin: IOExpander.PinNumber16;
  let a4988: A4988;

  beforeEach(() => {
    gpio = new MCP23017({} as any, 0x20);
    pwm = new PCA9685(50, 1.0, 0x40, {} as any);
    stepPin = 0;
    dirPin = 1;
    enablePin = 2;
    a4988 = new A4988(gpio, pwm, stepPin, dirPin, enablePin);
  });

  it('should set direction', async () => {
    await a4988.setDirection(true);
    expect(gpio.setPin).toHaveBeenCalledWith(dirPin, true);
  });

  it('should enable the motor', async () => {
    await a4988.enable();
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, false);
  });

  it('should disable the motor', async () => {
    await a4988.disable();
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, true);
  });

  it('should move the motor', async () => {
    const steps = 10;
    const direction = true;
    const speed = 1000;

    await a4988.move(steps, direction, speed);

    expect(gpio.setPin).toHaveBeenCalledWith(dirPin, direction);
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, false);
    expect(pwm.setPwm).toHaveBeenCalledTimes(steps * 2);
    expect(gpio.setPin).toHaveBeenCalledWith(enablePin, true);
  });
});
