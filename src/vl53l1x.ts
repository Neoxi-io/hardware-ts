import { EventEmitter } from 'events'
import { i2c } from './utils/ST_ULD/i2c'
import { constants as REG } from './utils/ST_ULD/define'
import * as st_uld from './utils/ST_ULD/VL53L1X_api'
import * as st_uld_calibration from './utils/ST_ULD/VL53L1X_calibration'
import debugFactory from 'debug'

type BusType = any

class VL53L1X extends EventEmitter {
  private dev: any
  private polarity: any
  private bus: BusType
  private initialize: Promise<void>
  private poller: NodeJS.Timeout | undefined
  private modes: Record<string, number> = { short: 1, long: 2 }
  private dwell_times: number[] = [20, 50, 100, 200, 500]
  private debug: debugFactory.Debugger

  constructor(bus: BusType, addr: number = 0x29, debug: boolean = false) {
    super()

    this.debug = debugFactory('VL53L1X')

    this.debug('Initializing VL53L1X with address %x, bus %d', addr, bus)

    if (debug) {
      debugFactory.enable('VL53L1X')
    }

    this.dev = i2c(addr, bus)
    this.bus = bus
    this.initialize = this.init()
    this.wrapFunctions()
  }

  private async init(): Promise<void> {
    while (!(await st_uld.VL53L1X_BootState(this.dev))) {
      this.debug('Wait for device boot - retry')
    }

    await st_uld.VL53L1X_SensorInit(this.dev)
    this.polarity = await st_uld.VL53L1X_GetInterruptPolarity(this.dev)
  }

  private async start(): Promise<void> {
    this.debug('start()')
    await st_uld.VL53L1X_StartRanging(this.dev)
  }

  private async stop(): Promise<void> {
    this.debug('stop()')
    await st_uld.VL53L1X_StopRanging(this.dev)
  }

  private async clear(): Promise<void> {
    this.debug('clear()')
    await st_uld.VL53L1X_ClearInterrupt(this.dev)
  }

  private async checkForDataReady(): Promise<boolean> {
    return st_uld.VL53L1X_CheckForDataReady(this.dev, this.polarity)
  }

  private async pollUntilDataReady(): Promise<void> {
    this.debug('pollUntilDataReady()')
    while (!(await this.checkForDataReady())) {
      this.debug('pollUntilDataReady() - retry')
    }
  }

  private async getResults(): Promise<any> {
    this.debug('getResults()')
    await this.pollUntilDataReady()
    const results = await st_uld.VL53L1X_GetResult(this.dev)
    this.emit('data', results)
    this.emit('distance', results.distance)
    return results
  }

  private async poll(): Promise<void> {
    await this.getResults() // emits the data
    await this.clear()
    this.poller = setTimeout(() => this.poll(), 1)
  }

  private wrapFunctions(): void {
    Object.keys(this).forEach((key) => {
      if (typeof (this as any)[key] === 'function' && key !== 'constructor' && key !== 'wrapFunctions') {
        const fn = (this as any)[key]
        ;(this as any)[key] = async (...args: any[]) => {
          await this.initialize
          ;(this as any)[key] = fn
          return fn.apply(this, args)
        }
      }
    })
  }

  public async mode(mode: string): Promise<void> {
    this.debug('mode(%s)', mode)
    const modeValue = this.modes[mode]
    if (!modeValue) throw new Error("Argument 'mode' must be either 'short' or 'long'")
    await st_uld.VL53L1X_SetDistanceMode(this.dev, modeValue)
  }

  public async timing(dwell?: number, sleep: number = 1): Promise<any> {
    if (dwell === undefined) {
      dwell = await st_uld.VL53L1X_GetTimingBudgetInMs(this.dev)
      return {
        dwell,
        sleep: (await st_uld.VL53L1X_GetInterMeasurementInMs(this.dev)) - dwell,
      }
    }
    this.debug('interval(%s, %s)', dwell, sleep)
    if (!this.dwell_times.includes(dwell)) throw new Error("Argument 'dwell' must be one of: " + this.dwell_times)
    await st_uld.VL53L1X_SetTimingBudgetInMs(this.dev, dwell)
    await st_uld.VL53L1X_SetInterMeasurementInMs(this.dev, dwell + (sleep ?? 1))
  }

  public async roi(width: number, height: number, center: number = 199): Promise<void> {
    this.debug('roi(%s, %s, %s)', width, height, center)
    if (width > 16) width = 16
    if (height > 16) height = 16

    if (width > 10 || height > 10) {
      center = 199
    }

    const XY = ((height - 1) << 4) | (width - 1)
    await this.dev.writeReg(REG.ROI_CONFIG__USER_ROI_CENTRE_SPAD, center)
    await this.dev.writeReg(REG.ROI_CONFIG__USER_ROI_REQUESTED_GLOBAL_XY_SIZE, XY)
  }

  public async offset(mm: number): Promise<void> {
    await st_uld.VL53L1X_SetOffset(this.dev, mm)
  }

  public async xtalk(cps: number): Promise<void> {
    await st_uld.VL53L1X_SetXtalk(this.dev, cps)
  }

  public async startMeasurement(interval: number = 1): Promise<void> {
    this.debug('start()')
    await this.clear()
    await this.start()
    this.poller = setTimeout(() => this.poll(), interval)
  }

  public async stopMeasurement(): Promise<void> {
    this.debug('stop()')
    clearTimeout(this.poller)
    this.poller = undefined
    await this.stop()
  }

  public async measure(): Promise<number> {
    if (!this.poller) {
      await this.clear()
      this.debug('start SINGLESHOT')
      await this.dev.writeReg(REG.SYSTEM__MODE_START, 0x10) // SINGLESHOT
      return (await this.getResults()).distance
    }
    return new Promise((resolve) => {
      this.once('data', resolve)
    })
  }

  public async calibrateOffset(distance: number): Promise<void> {
    await st_uld_calibration.VL53L1X_CalibrateOffset(this.dev, distance)
  }

  public async calibrateXtalk(distance: number): Promise<void> {
    await st_uld_calibration.VL53L1X_CalibrateXtalk(this.dev, distance)
  }
}

export default VL53L1X
