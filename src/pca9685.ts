import { I2CBus } from 'i2c-bus'
import sleep from 'sleep'
import debugFactory from 'debug'

const __MODE1 = 0x00,
  __PRESCALE = 0xfe,
  __LED0_ON_L = 0x06,
  __LED0_ON_H = 0x07,
  __LED0_OFF_L = 0x08,
  __LED0_OFF_H = 0x09,
  __ALLLED_ON_L = 0xfa,
  __ALLLED_ON_H = 0xfb,
  __ALLLED_OFF_L = 0xfc,
  __ALLLED_OFF_H = 0xfd

class PCA9685 {
  private readonly frequency: number
  private readonly correctionFactor: number
  private readonly address: number
  private readonly i2c: I2CBus
  private readonly debug: debugFactory.Debugger

  /**
   * Creates an instance of PwmController.
   * @param {number} [frequency=50] - The frequency of the PWM signal.
   * @param {number} [correctionFactor=1.0] - The correction factor for the frequency.
   * @param {number} [address=0x40] - The I2C address of the PWM controller.
   * @param {number} [bus] - The I2C bus.
   * @param {boolean} [debug=false] - Enable debug mode.
   */
  constructor(frequency: number = 50, correctionFactor: number = 1.0, address: number = 0x40, bus: I2CBus, debug: boolean = false) {
    this.debug = debugFactory('PCA9685')

    this.debug('Initializing PwmController with frequency %d, correctionFactor %d, address %x, bus %d', frequency, correctionFactor, address, bus)

    this.frequency = frequency
    this.correctionFactor = correctionFactor
    this.address = address
    this.i2c = bus

    this.i2c.writeByteSync(this.address, __MODE1, 0x00)
    this.setFreq(this.frequency, this.correctionFactor)
    this.clearAll()

    if (debug) {
      debugFactory.enable('pca9685')
    }
  }

  /**
   * Validates the frequency.
   * @param {number} freq - The frequency to validate.
   * @returns {boolean} True if the frequency is valid, false otherwise.
   * @private
   */
  private isValidFreq(freq: number): boolean {
    const valid = freq >= 40 && freq <= 1000
    this.debug('isValidFreq(%d) -> %s', freq, valid)
    return valid
  }

  /**
   * Validates the channel number.
   * @param {number} channel - The channel number to validate.
   * @returns {boolean} True if the channel is valid, false otherwise.
   * @private
   */
  private isValidChannel(channel: number): boolean {
    const valid = channel >= 0 && channel <= 15
    this.debug('isValidChannel(%d) -> %s', channel, valid)
    return valid
  }

  /**
   * Validates the PWM value.
   * @param {number} value - The PWM value to validate.
   * @returns {boolean} True if the PWM value is valid, false otherwise.
   * @private
   */
  private isValidPwm(value: number): boolean {
    const valid = value >= 0 && value <= 4095
    this.debug('isValidPwm(%d) -> %s', value, valid)
    return valid
  }

  /**
   * Validates the pulse duration.
   * @param {number} pulse - The pulse duration to validate.
   * @param {number} frequency - The frequency to validate against.
   * @returns {boolean} True if the pulse duration is valid, false otherwise.
   * @private
   */
  private isValidPulse(pulse: number, frequency: number): boolean {
    const period = 1000000 / frequency // Period in microseconds
    const valid = pulse > 0 && pulse < period
    this.debug('isValidPulse(%d, %d) -> %s', pulse, frequency, valid)
    return valid
  }

  /**
   * Clears all PWM channels.
   * @private
   */
  private clearAll() {
    this.debug('Clearing all PWM channels')
    for (let channel = 0; channel < 16; channel++) {
      this.setPwm(channel, 0, 0)
    }
  }

  /**
   * Sets the frequency of the PWM signal.
   * @param {number} freq - The desired frequency.
   * @param {number} [correctionFactor=1.0] - The correction factor for the frequency.
   * @throws Will throw an error if the frequency is not valid.
   */
  setFreq(freq: number, correctionFactor: number = 1.0) {
    if (!this.isValidFreq(freq)) throw new Error('Frequency must be between 40 and 1000 Hz')

    let prescaleval = 25000000 / 4096 / freq - 1
    let prescale = Math.floor(prescaleval * correctionFactor + 0.5)

    this.debug('Setting frequency to %d Hz with correction factor %d (prescale: %d)', freq, correctionFactor, prescale)

    let oldmode = this.i2c.readByteSync(this.address, __MODE1)
    let newmode = (oldmode & 0x7f) | 0x10 // sleep

    this.i2c.writeByteSync(this.address, __MODE1, newmode) // go to sleep
    this.i2c.writeByteSync(this.address, __PRESCALE, prescale) // set the prescaler
    this.i2c.writeByteSync(this.address, __MODE1, oldmode)
    sleep.usleep(10000)
    this.i2c.writeByteSync(this.address, __MODE1, oldmode | 0x80)
  }

  /**
   * Sets the PWM values for a channel.
   * @param {number} channel - The PWM channel.
   * @param {number} pulseOn - The pulse start value.
   * @param {number} pulseOff - The pulse end value.
   * @throws Will throw an error if the inputs are not valid.
   */
  setPwm(channel: number, pulseOn: number, pulseOff: number) {
    if (!(this.isValidChannel(channel) && this.isValidPwm(pulseOn) && this.isValidPwm(pulseOff))) {
      throw new Error('Invalid inputs to setPwm')
    }

    this.debug('Setting PWM for channel %d: pulseOn=%d, pulseOff=%d', channel, pulseOn, pulseOff)

    this.i2c.writeByteSync(this.address, __LED0_ON_L + 4 * channel, pulseOn & 0xff)
    this.i2c.writeByteSync(this.address, __LED0_ON_H + 4 * channel, pulseOn >> 8)
    this.i2c.writeByteSync(this.address, __LED0_OFF_L + 4 * channel, pulseOff & 0xff)
    this.i2c.writeByteSync(this.address, __LED0_OFF_H + 4 * channel, pulseOff >> 8)
  }

  /**
   * Sets the pulse duration for a channel.
   * @param {number} channel - The PWM channel.
   * @param {number} pulse - The pulse duration in microseconds.
   * @throws Will throw an error if the inputs are not valid.
   */
  setPulse(channel: number, pulse: number) {
    if (!this.isValidChannel(channel)) throw new Error('Channel must be between 0 and 15')
    if (!this.isValidPulse(pulse, this.frequency)) throw new Error('Pulse must be > 0 and less than PWM period')

    const pulseLength = 1000000 / this.frequency / 4096 // time per 1 unit in microseconds
    const pulseCount = pulse / pulseLength

    this.debug('Setting pulse for channel %d: pulse=%d (pulseCount=%d)', channel, pulse, pulseCount)

    this.setPwm(channel, 0, Math.floor(pulseCount))
  }

  /**
   * Stops the PWM signal and clears all channels.
   */
  stop() {
    this.debug('Stopping PWM signal and clearing all channels')
    this.clearAll()
  }

  getFrequency(): number {
    return this.frequency
  }
}

export default PCA9685
