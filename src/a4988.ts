import debugFactory from 'debug'
import { MCP23017 } from './mcp23017'
import { IOExpander } from './utils/ioExpander'
import PCA9685 from './pca9685'

export enum ActuatorType {
  LINEAR_ACTUATOR_TOP_LEFT = 'LINEAR_ACTUATOR_TOP_LEFT',
  LINEAR_ACTUATOR_TOP_RIGHT = 'LINEAR_ACTUATOR_TOP_RIGHT',
  LINEAR_ACTUATOR_BOTTOM_LEFT = 'LINEAR_ACTUATOR_BOTTOM_LEFT',
  LINEAR_ACTUATOR_BOTTOM_RIGHT = 'LINEAR_ACTUATOR_BOTTOM_RIGHT',
  GANTRY_PROTO = 'GANTRY_PROTO',
}

export enum ActuatorDirection {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum ActuatorStatus {
  STOPPED = 0,
  MOVING_UP = 1,
  MOVING_DOWN = -1,
}

export class A4988 {
  private readonly name: ActuatorType
  private readonly debug: debugFactory.Debugger
  private readonly gpioBoard: MCP23017
  private readonly pwmBoard: PCA9685
  private readonly directionPin: IOExpander.PinNumber16
  private readonly enablePin: IOExpander.PinNumber16
  private readonly stepPin: number
  private status: ActuatorStatus = ActuatorStatus.STOPPED
  private direction: ActuatorDirection = ActuatorDirection.UP

  constructor(name: ActuatorType, gpioBoard: MCP23017, pwmBoard: PCA9685, directionPin: IOExpander.PinNumber16, enablePin: IOExpander.PinNumber16, stepPin: number, debug: boolean = false) {
    this.debug = debugFactory(`Actuator:${name}`)

    this.name = name
    this.gpioBoard = gpioBoard
    this.pwmBoard = pwmBoard
    this.directionPin = directionPin
    this.enablePin = enablePin
    this.stepPin = stepPin

    if (debug) {
      debugFactory.enable(`Actuator:${name}`)
    }

    this.debug('Initializing Actuator')
  }

  async enable() {
    this.debug('Enabling actuator')
    await this.gpioBoard.setPin(this.enablePin, true)
  }

  async disable() {
    this.debug('Disabling actuator')
    await this.gpioBoard.setPin(this.enablePin, false)
  }

  async setDirection(direction: ActuatorDirection) {
    this.debug('Setting direction to %s', direction)
    await this.gpioBoard.setPin(this.directionPin, direction === ActuatorDirection.UP)
    this.direction = direction
  }

  move() {
    this.debug('Moving actuator')
    this.pwmBoard.setPwm(this.stepPin, 0, 100)

    this.status = this.direction === ActuatorDirection.UP ? ActuatorStatus.MOVING_UP : ActuatorStatus.MOVING_DOWN
  }

  stop() {
    this.debug('Stopping actuator')
    this.pwmBoard.setPwm(this.stepPin, 0, 0)

    this.status = ActuatorStatus.STOPPED
  }

  getStatus(): number {
    return this.status
  }
}
