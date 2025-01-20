// AS5600 : 12-Bit Programmable Contactless Potentiometer
// driver for WebI2C
// Programmed by Satoru Takagi
// 
// https://ams.com/documents/20143/36005/AS5600_DS000365_5-00.pdf
// https://qiita.com/GANTZ/items/63a66161a5a7eeaf6a62
//

import { I2CBus } from "i2c-bus";

const ADDRESS = 0x36

interface Status {
  detected: boolean;
  tooLow: boolean;
  tooHigh: boolean;
}

export class AS5600 {

  private i2cBus: I2CBus
  private address: number

  constructor(bus: I2CBus, address: number = 0x36) {
    this.i2cBus = bus
    this.address = address
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async init(): Promise<void> {
    // Ensure the bus is open before attempting to communicate
    await this.i2cBus.i2cFuncsSync();
  }

  public async getRawStatus(): Promise<number> {
    const status = await this.i2cBus.readByteSync(this.address, 0x0b);
    return status;
  }

  public async getStatus(): Promise<Status> {
    const rstat = await this.getRawStatus();
    const mh = (rstat >> 3) & 1;
    const ml = (rstat >> 4) & 1;
    const md = (rstat >> 5) & 1;
    return {
      detected: Boolean(md),
      tooLow: Boolean(ml),
      tooHigh: Boolean(mh),
    };
  }

  public async getRawAngle(): Promise<number> {
    const buffer = Buffer.alloc(2);
    await this.i2cBus.readI2cBlockSync(this.address, 0x0c, 2, buffer);
    const angle = (buffer[0] << 8) | buffer[1];
    return angle;
  }

  public async getAngle(): Promise<number> {
    const rawAngle = await this.getRawAngle();
    const angle = (360 * rawAngle) / 4096;
    return angle;
  }
}
