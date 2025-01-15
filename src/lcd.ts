import * as i2c from 'i2c-bus'
import * as sleep from 'sleep'
import debugFactory from 'debug'

interface DisplayPorts {
  RS: number
  E: number
  D4: number
  D5: number
  D6: number
  D7: number
  CHR: number
  CMD: number
  backlight: number
  RW: number // not used
}

const _CLEARDISPLAY = 0x01
const _RETURNHOME = 0x02
const _ENTRYMODESET = 0x04
const _DISPLAYCONTROL = 0x08
const _CURSORSHIFT = 0x10
const _FUNCTIONSET = 0x20
const _SETCGRAMADDR = 0x40
const _SETDDRAMADDR = 0x80

const _ENTRYRIGHT = 0x00
const _ENTRYLEFT = 0x02
const _ENTRYSHIFTINCREMENT = 0x01
const _ENTRYSHIFTDECREMENT = 0x00

const _DISPLAYON = 0x04
const _DISPLAYOFF = 0x00
const _CURSORON = 0x02
const _CURSOROFF = 0x00
const _BLINKON = 0x01
const _BLINKOFF = 0x00

const _DISPLAYMOVE = 0x08
const _CURSORMOVE = 0x00
const _MOVERIGHT = 0x04
const _MOVELEFT = 0x00

const _8BITMODE = 0x10
const _4BITMODE = 0x00
const _2LINE = 0x08
const _1LINE = 0x00
const _5x10DOTS = 0x04
const _5x8DOTS = 0x00

export class LCD {
  private _LINEADDRESS: number[]

  private debug: debugFactory.Debugger
  private bus: i2c.I2CBus
  private address: number
  private _cols: number
  private _rows: number
  private _blinking: boolean
  private _cursor: boolean
  private _began: boolean

  private displayPorts: DisplayPorts = {
    RS: 0x01,
    E: 0x04,
    D4: 0x10,
    D5: 0x20,
    D6: 0x40,
    D7: 0x80,
    CHR: 1,
    CMD: 0,
    backlight: 0x08,
    RW: 0x20, // not used
  }

  constructor(name: string, bus: i2c.I2CBus, address: number, cols: number, rows: number, linesAddresses: number[] = [0x80, 0xc0, 0x94, 0xd4], debug = false) {
    this.debug = debugFactory(`LCD:${name}`)

    this.debug('Initializing LCD with address %x, bus %d, cols %d, rows %d', address, bus, cols, rows)

    this._LINEADDRESS = linesAddresses
    this.address = address
    this.bus = bus
    this._cols = cols
    this._rows = rows
    this._blinking = false
    this._cursor = false
    this._began = false

    if (debug) {
      debugFactory.enable(`LCD:${name}`)
    }
  }

  async begin(): Promise<void> {
    return new Promise((res, rej) => {
      this.beginAsync((err) => {
        if (err) {
          rej(err)
        } else {
          res()
        }
      })
    })
  }

  beginSync(): LCD {
    if (this._began) {
      throw new Error('The LCD is already initialized! You called begin() twice!')
    }
    this._write4Sync(0x33, this.displayPorts.CMD) // initialization
    this._write4Sync(0x32, this.displayPorts.CMD) // initialization
    this._write4Sync(0x06, this.displayPorts.CMD) // initialization
    this._write4Sync(0x28, this.displayPorts.CMD) // initialization
    this._write4Sync(0x01, this.displayPorts.CMD) // initialization
    this._writeSync(_FUNCTIONSET | _4BITMODE | _2LINE | _5x10DOTS, this.displayPorts.CMD) // 4 bit - 2 line 5x7 matrix
    this._writeSync(_DISPLAYCONTROL | _DISPLAYON, this.displayPorts.CMD) // turn cursor off 0x0E to enable cursor
    this._writeSync(_ENTRYMODESET | _ENTRYLEFT, this.displayPorts.CMD) // shift cursor right
    this._writeSync(_CLEARDISPLAY, this.displayPorts.CMD) // LCD clear
    this._writeSync(this.displayPorts.backlight, this.displayPorts.CHR) // Turn on backlight.
    this._began = true
    return this
  }

  async beginAsync(cb: (err?: Error) => void): Promise<void> {
    if (this._began) {
      cb(new Error('The LCD is already initialized! You called begin() twice!'))
      return
    }

    try {
      await this._write4(0x33, this.displayPorts.CMD) // initialization
      await this._write4(0x32, this.displayPorts.CMD) // initialization
      await this._write4(0x06, this.displayPorts.CMD) // initialization
      await this._write4(0x28, this.displayPorts.CMD) // initialization
      await this._write4(0x01, this.displayPorts.CMD) // initialization
      await this._write4(_FUNCTIONSET | _4BITMODE | _2LINE | _5x10DOTS, this.displayPorts.CMD) // 4 bit - 2 line 5x7 matrix
      await this._write(_DISPLAYCONTROL | _DISPLAYON, this.displayPorts.CMD) // turn cursor off 0x0E to enable cursor
      await this._write(_ENTRYMODESET | _ENTRYLEFT, this.displayPorts.CMD) // shift cursor right
      await this._write(_CLEARDISPLAY, this.displayPorts.CMD) // LCD clear
      await this._write(this.displayPorts.backlight, this.displayPorts.CHR) // Turn on backlight.
    } catch (e) {
      if (cb) {
        cb(e as Error)
      }
      return
    }
    this._began = true
    if (cb) {
      cb()
    }
  }

  async clear(): Promise<void> {
    return this._write(_CLEARDISPLAY, this.displayPorts.CMD)
  }

  clearSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_CLEARDISPLAY, this.displayPorts.CMD)
  }

  clearAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_CLEARDISPLAY, this.displayPorts.CMD, cb)
  }

  async home(): Promise<void> {
    return this._write(_SETDDRAMADDR, this.displayPorts.CMD)
  }

  homeSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_SETDDRAMADDR, this.displayPorts.CMD)
  }

  homeAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_SETDDRAMADDR, this.displayPorts.CMD, cb)
  }

  async print(str: string, line: number): Promise<void> {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    if (line < 0 || line >= this._LINEADDRESS.length) {
      throw new Error('The line parameter must be between 0 and ' + (this._LINEADDRESS.length - 1))
    }
    await this._write(this._LINEADDRESS[line], this.displayPorts.CMD)
    for (let i = 0; i < this._cols; i++) {
      await this._write(str.charCodeAt(i), this.displayPorts.CHR)
    }
  }

  printSync(str: string, line: number): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    if (line < 0 || line >= this._LINEADDRESS.length) {
      throw new Error('The line parameter must be between 0 and ' + (this._LINEADDRESS.length - 1))
    }
    this._writeSync(this._LINEADDRESS[line], this.displayPorts.CMD)
    for (let i = 0; i < this._cols; i++) {
      this._writeSync(str.charCodeAt(i), this.displayPorts.CHR)
    }
  }

  printAsync(str: string, line: number, cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    if (line < 0 || line >= this._LINEADDRESS.length) {
      cb(new Error('The line parameter must be between 0 and ' + (this._LINEADDRESS.length - 1)))
      return
    }
    this._writeAsync(this._LINEADDRESS[line], this.displayPorts.CMD, async (err) => {
      if (err) {
        cb(err)
        return
      }
      for (let i = 0; i < this._cols; i++) {
        await this._write(str.charCodeAt(i), this.displayPorts.CHR)
      }
      cb()
    })
  }

  async noDisplay(): Promise<void> {
    return this._write(_DISPLAYCONTROL | _DISPLAYOFF, this.displayPorts.CMD)
  }

  noDisplaySync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_DISPLAYCONTROL | _DISPLAYOFF, this.displayPorts.CMD)
  }

  noDisplayAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_DISPLAYCONTROL | _DISPLAYOFF, this.displayPorts.CMD, cb)
  }

  async display(): Promise<void> {
    return this._write(_DISPLAYCONTROL | _DISPLAYON, this.displayPorts.CMD)
  }

  displaySync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_DISPLAYCONTROL | _DISPLAYON, this.displayPorts.CMD)
  }

  displayAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_DISPLAYCONTROL | _DISPLAYON, this.displayPorts.CMD, cb)
  }

  async cursor(): Promise<void> {
    return this._write(_DISPLAYCONTROL | _CURSORON, this.displayPorts.CMD)
  }

  cursorSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_DISPLAYCONTROL | _CURSORON, this.displayPorts.CMD)
  }

  cursorAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_DISPLAYCONTROL | _CURSORON, this.displayPorts.CMD, cb)
  }

  async noCursor(): Promise<void> {
    return this._write(_DISPLAYCONTROL | _CURSOROFF, this.displayPorts.CMD)
  }

  noCursorSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_DISPLAYCONTROL | _CURSOROFF, this.displayPorts.CMD)
  }

  noCursorAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_DISPLAYCONTROL | _CURSOROFF, this.displayPorts.CMD, cb)
  }

  async blink(): Promise<void> {
    return this._write(_DISPLAYCONTROL | _BLINKON, this.displayPorts.CMD)
  }

  blinkSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_DISPLAYCONTROL | _BLINKON, this.displayPorts.CMD)
  }

  blinkAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_DISPLAYCONTROL | _BLINKON, this.displayPorts.CMD, cb)
  }

  async noBlink(): Promise<void> {
    return this._write(_DISPLAYCONTROL | _BLINKOFF, this.displayPorts.CMD)
  }

  noBlinkSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(_DISPLAYCONTROL | _BLINKOFF, this.displayPorts.CMD)
  }

  noBlinkAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(_DISPLAYCONTROL | _BLINKOFF, this.displayPorts.CMD, cb)
  }

  async backlight(): Promise<void> {
    return this._write(this.displayPorts.backlight, this.displayPorts.CHR)
  }

  backlightSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(this.displayPorts.backlight, this.displayPorts.CHR)
  }

  backlightAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(this.displayPorts.backlight, this.displayPorts.CHR, cb)
  }

  async noBacklight(): Promise<void> {
    return this._write(0x00, this.displayPorts.CHR)
  }

  noBacklightSync(): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    this._writeSync(0x00, this.displayPorts.CHR)
  }

  noBacklightAsync(cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    this._writeAsync(0x00, this.displayPorts.CHR, cb)
  }

  async createChar(location: number, charmap: number[]): Promise<void> {
    if (location < 0 || location > 7) {
      throw new Error('The location parameter must be between 0 and 7')
    }
    location &= 0x7 // we only have 8 locations 0-7
    await this._write(_SETCGRAMADDR | (location << 3), this.displayPorts.CMD)
    for (let i = 0; i < 8; i++) {
      await this._write(charmap[i], this.displayPorts.CHR)
    }
  }

  createCharSync(location: number, charmap: number[]): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    if (location < 0 || location > 7) {
      throw new Error('The location parameter must be between 0 and 7')
    }
    location &= 0x7 // we only have 8 locations 0-7
    this._writeSync(_SETCGRAMADDR | (location << 3), this.displayPorts.CMD)
    for (let i = 0; i < 8; i++) {
      this._writeSync(charmap[i], this.displayPorts.CHR)
    }
  }

  createCharAsync(location: number, charmap: number[], cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    if (location < 0 || location > 7) {
      cb(new Error('The location parameter must be between 0 and 7'))
      return
    }
    location &= 0x7 // we only have 8 locations 0-7
    this._writeAsync(_SETCGRAMADDR | (location << 3), this.displayPorts.CMD, async (err) => {
      if (err) {
        cb(err)
        return
      }
      for (let i = 0; i < 8; i++) {
        await this._write(charmap[i], this.displayPorts.CHR)
      }
      cb()
    })
  }

  async setCursor(col: number, row: number): Promise<void> {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    if (col < 0 || col >= this._cols) {
      throw new Error('The col parameter must be between 0 and ' + (this._cols - 1))
    }
    if (row < 0 || row >= this._rows) {
      throw new Error('The row parameter must be between 0 and ' + (this._rows - 1))
    }
    await this._write(this._LINEADDRESS[row] + col, this.displayPorts.CMD)
  }

  setCursorSync(col: number, row: number): void {
    if (!this._began) {
      throw new Error('The LCD is not initialized! Call begin() before using any method!')
    }
    if (col < 0 || col >= this._cols) {
      throw new Error('The col parameter must be between 0 and ' + (this._cols - 1))
    }
    if (row < 0 || row >= this._rows) {
      throw new Error('The row parameter must be between 0 and ' + (this._rows - 1))
    }
    this._writeSync(this._LINEADDRESS[row] + col, this.displayPorts.CMD)
  }

  setCursorAsync(col: number, row: number, cb: (err?: Error) => void): void {
    if (!this._began) {
      cb(new Error('The LCD is not initialized! Call begin() before using any method!'))
      return
    }
    if (col < 0 || col >= this._cols) {
      cb(new Error('The col parameter must be between 0 and ' + (this._cols - 1)))
      return
    }
    if (row < 0 || row >= this._rows) {
      cb(new Error('The row parameter must be between 0 and ' + (this._rows - 1)))
      return
    }
    this._writeAsync(this._LINEADDRESS[row] + col, this.displayPorts.CMD, cb)
  }

  async _write4(value: number, mode: number): Promise<void> {
    const buf = Buffer.alloc(1)
    buf[0] = value | mode | this.displayPorts.backlight
    await new Promise((resolve, reject) =>
      this.bus.writeByte(this.address, 0, buf[0], (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(null)
        }
      }),
    )
    this._pulseEnable(value | mode | this.displayPorts.backlight)
  }

  _write4Sync(value: number, mode: number): void {
    const buf = Buffer.alloc(1)
    buf[0] = value | mode | this.displayPorts.backlight
    this.bus.writeByteSync(this.address, 0, buf[0])
    this._pulseEnableSync(value | mode | this.displayPorts.backlight)
  }

  _write4Async(value: number, mode: number, cb: (err?: Error) => void): void {
    const buf = Buffer.alloc(1)
    buf[0] = value | mode | this.displayPorts.backlight
    this.bus.writeByte(this.address, 0, buf[0], (err) => {
      if (err) {
        cb(err)
        return
      }
      this._pulseEnableAsync(value | mode | this.displayPorts.backlight, cb)
    })
  }

  async _write(value: number, mode: number): Promise<void> {
    await this._write4(value & 0xf0, mode)
    await this._write4((value << 4) & 0xf0, mode)
  }

  _writeSync(value: number, mode: number): void {
    this._write4Sync(value & 0xf0, mode)
    this._write4Sync((value << 4) & 0xf0, mode)
  }

  _writeAsync(value: number, mode: number, cb: (err?: Error) => void): void {
    this._write4Async(value & 0xf0, mode, (err) => {
      if (err) {
        cb(err)
        return
      }
      this._write4Async((value << 4) & 0xf0, mode, cb)
    })
  }

  async _pulseEnable(value: number): Promise<void> {
    await this._write4(value | this.displayPorts.E, this.displayPorts.CMD)
    sleep.usleep(500)
    await this._write4(value & ~this.displayPorts.E, this.displayPorts.CMD)
    sleep.usleep(100)
  }

  _pulseEnableSync(value: number): void {
    this._write4Sync(value | this.displayPorts.E, this.displayPorts.CMD)
    sleep.usleep(500)
    this._write4Sync(value & ~this.displayPorts.E, this.displayPorts.CMD)
    sleep.usleep(100)
  }

  _pulseEnableAsync(value: number, cb: (err?: Error) => void): void {
    this._write4Async(value | this.displayPorts.E, this.displayPorts.CMD, (err) => {
      if (err) {
        cb(err)
        return
      }
      sleep.usleep(500)
      this._write4Async(value & ~this.displayPorts.E, this.displayPorts.CMD, (err) => {
        if (err) {
          cb(err)
          return
        }
        sleep.usleep(100)
        cb()
      })
    })
  }
}
