import PCA9685 from '../pca9685';
import { openPromisified } from 'i2c-bus';
import sleep from 'sleep';

jest.mock('i2c-bus');
jest.mock('sleep');

describe('PCA9685', () => {
  let mockI2CBus: any;

  beforeEach(async () => {
    mockI2CBus = await openPromisified(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const pwm = new PCA9685(50, 1.0, 0x40, mockI2CBus);
    expect(pwm.getFrequency()).toBe(50);
  });

  it('should set frequency correctly', () => {
    const pwm = new PCA9685(50, 1.0, 0x40, mockI2CBus);
    pwm.setFreq(100);
    expect(mockI2CBus.writeByteSync).toHaveBeenCalled();
  });

  it('should set PWM values correctly', () => {
    const pwm = new PCA9685(50, 1.0, 0x40, mockI2CBus);
    pwm.setPwm(0, 0, 2048);
    expect(mockI2CBus.writeByteSync).toHaveBeenCalledTimes(4);
  });

  it('should set pulse duration correctly', () => {
    const pwm = new PCA9685(50, 1.0, 0x40, mockI2CBus);
    pwm.setPulse(0, 1500);
    expect(mockI2CBus.writeByteSync).toHaveBeenCalledTimes(4);
  });

  it('should stop PWM signal and clear all channels', () => {
    const pwm = new PCA9685(50, 1.0, 0x40, mockI2CBus);
    pwm.stop();
    expect(mockI2CBus.writeByteSync).toHaveBeenCalledTimes(64);
  });
});
