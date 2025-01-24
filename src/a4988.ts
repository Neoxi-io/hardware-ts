import { MCP23017 } from './mcp23017'
import PCA9685 from './pca9685'
import { IOExpander } from './utils/ioExpander'

export class A4988 {
  private gpio: MCP23017
  private pwm: PCA9685
  private stepPin: IOExpander.PinNumber16
  private dirPin: IOExpander.PinNumber16
  private enablePin: IOExpander.PinNumber16
  private stepID: string
  private dirID: string
  private enableID: string

  constructor(gpio: MCP23017, pwm: PCA9685, stepPin: IOExpander.PinNumber16, dirPin: IOExpander.PinNumber16, enablePin: IOExpander.PinNumber16, stepID: string, dirID: string, enableID: string) {
    this.gpio = gpio
    this.pwm = pwm
    this.stepPin = stepPin
    this.dirPin = dirPin
    this.enablePin = enablePin
    this.stepID = stepID
    this.dirID = dirID
    this.enableID = enableID

    this.gpio.outputPin(this.stepPin, false)
    this.gpio.outputPin(this.dirPin, false)
    this.gpio.outputPin(this.enablePin, false)
  }

  async setDirection(direction: boolean) {
    await this.gpio.setPin(this.dirPin, direction)
    return { [this.dirID]: direction }
  }

  async enable() {
    await this.gpio.setPin(this.enablePin, false)
    return { [this.enableID]: true }
  }

  async disable() {
    await this.gpio.setPin(this.enablePin, true)
    return { [this.enableID]: false }
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
    return { [this.stepID]: steps }
  }
}
