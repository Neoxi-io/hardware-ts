import { MCP23017 } from './mcp23017'
import PCA9685 from './pca9685'

export class A4988 {
  private gpio: MCP23017
  private pwm: PCA9685
  private stepPin: number
  private dirPin: number
  private enablePin: number

  constructor(gpio: MCP23017, pwm: PCA9685, stepPin: number, dirPin: number, enablePin: number) {
    this.gpio = gpio
    this.pwm = pwm
    this.stepPin = stepPin
    this.dirPin = dirPin
    this.enablePin = enablePin

    this.gpio.outputPin(this.stepPin, false)
    this.gpio.outputPin(this.dirPin, false)
    this.gpio.outputPin(this.enablePin, false)
  }

  async setDirection(direction: boolean) {
    await this.gpio.setPin(this.dirPin, direction)
  }

  async enable() {
    await this.gpio.setPin(this.enablePin, false)
  }

  async disable() {
    await this.gpio.setPin(this.enablePin, true)
  }

  async move(steps: number, direction: boolean, speed: number) {
    await this.setDirection(direction)
    await this.enable()

    const pulseLength = 1000000 / this.pwm.getFrequency() / 4096
    const pulseCount = speed / pulseLength

    for (let i = 0; i < steps; i++) {
      await this.pwm.setPwm(this.stepPin, 0, Math.floor(pulseCount))
      await this.pwm.setPwm(this.stepPin, 0, 0)
    }

    await this.disable()
  }
}
