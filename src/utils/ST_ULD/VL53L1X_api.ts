import { constants as REG } from './define'

const VL51L1X_DEFAULT_CONFIGURATION = [
  0x00 /* 0x2d : set bit 2 and 5 to 1 for fast plus mode (1MHz I2C), else don't touch */, 0x01 /* 0x2e : bit 0 if I2C pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */, 0x00 /* 0x2f : bit 0 if GPIO pulled up at 1.8V, else set bit 0 to 1 (pull up at AVDD) */, 0x01 /* 0x30 : set bit 4 to 0 for active high interrupt and 1 for active low (bits 3:0 must be 0x1), use SetInterruptPolarity() */, 0x02 /* 0x31 : bit 1 = interrupt depending on the polarity, use CheckForDataReady() */,
  0x00 /* 0x32 : not user-modifiable */, 0x02 /* 0x33 : not user-modifiable */, 0x08 /* 0x34 : not user-modifiable */, 0x00 /* 0x35 : not user-modifiable */, 0x08 /* 0x36 : not user-modifiable */, 0x10 /* 0x37 : not user-modifiable */, 0x01 /* 0x38 : not user-modifiable */, 0x01 /* 0x39 : not user-modifiable */, 0x00 /* 0x3a : not user-modifiable */, 0x00 /* 0x3b : not user-modifiable */, 0x00 /* 0x3c : not user-modifiable */, 0x00 /* 0x3d : not user-modifiable */,
  0xff /* 0x3e : not user-modifiable */, 0x00 /* 0x3f : not user-modifiable */, 0x0f /* 0x40 : not user-modifiable */, 0x00 /* 0x41 : not user-modifiable */, 0x00 /* 0x42 : not user-modifiable */, 0x00 /* 0x43 : not user-modifiable */, 0x00 /* 0x44 : not user-modifiable */, 0x00 /* 0x45 : not user-modifiable */, 0x20 /* 0x46 : interrupt configuration 0->level low detection, 1-> level high, 2-> Out of window, 3->In window, 0x20-> New sample ready , TBC */, 0x0b /* 0x47 : not user-modifiable */,
  0x00 /* 0x48 : not user-modifiable */, 0x00 /* 0x49 : not user-modifiable */, 0x02 /* 0x4a : not user-modifiable */, 0x0a /* 0x4b : not user-modifiable */, 0x21 /* 0x4c : not user-modifiable */, 0x00 /* 0x4d : not user-modifiable */, 0x00 /* 0x4e : not user-modifiable */, 0x05 /* 0x4f : not user-modifiable */, 0x00 /* 0x50 : not user-modifiable */, 0x00 /* 0x51 : not user-modifiable */, 0x00 /* 0x52 : not user-modifiable */, 0x00 /* 0x53 : not user-modifiable */,
  0xc8 /* 0x54 : not user-modifiable */, 0x00 /* 0x55 : not user-modifiable */, 0x00 /* 0x56 : not user-modifiable */, 0x38 /* 0x57 : not user-modifiable */, 0xff /* 0x58 : not user-modifiable */, 0x01 /* 0x59 : not user-modifiable */, 0x00 /* 0x5a : not user-modifiable */, 0x08 /* 0x5b : not user-modifiable */, 0x00 /* 0x5c : not user-modifiable */, 0x00 /* 0x5d : not user-modifiable */, 0x01 /* 0x5e : not user-modifiable */, 0xcc /* 0x5f : not user-modifiable */,
  0x0f /* 0x60 : not user-modifiable */, 0x01 /* 0x61 : not user-modifiable */, 0xf1 /* 0x62 : not user-modifiable */, 0x0d /* 0x63 : not user-modifiable */, 0x01 /* 0x64 : Sigma threshold MSB (mm in 14.2 format for MSB+LSB), use SetSigmaThreshold(), default value 90 mm  */, 0x68 /* 0x65 : Sigma threshold LSB */, 0x00 /* 0x66 : Min count Rate MSB (MCPS in 9.7 format for MSB+LSB), use SetSignalThreshold() */, 0x80 /* 0x67 : Min count Rate LSB */, 0x08 /* 0x68 : not user-modifiable */,
  0xb8 /* 0x69 : not user-modifiable */, 0x00 /* 0x6a : not user-modifiable */, 0x00 /* 0x6b : not user-modifiable */, 0x00 /* 0x6c : Intermeasurement period MSB, 32 bits register, use SetIntermeasurementInMs() */, 0x00 /* 0x6d : Intermeasurement period */, 0x0f /* 0x6e : Intermeasurement period */, 0x89 /* 0x6f : Intermeasurement period LSB */, 0x00 /* 0x70 : not user-modifiable */, 0x00 /* 0x71 : not user-modifiable */,
  0x00 /* 0x72 : distance threshold high MSB (in mm, MSB+LSB), use SetDistanceThreshold() */, 0x00 /* 0x73 : distance threshold high LSB */, 0x00 /* 0x74 : distance threshold low MSB ( in mm, MSB+LSB), use SetDistanceThreshold() */, 0x00 /* 0x75 : distance threshold low LSB */, 0x00 /* 0x76 : not user-modifiable */, 0x01 /* 0x77 : not user-modifiable */, 0x0f /* 0x78 : not user-modifiable */, 0x0d /* 0x79 : not user-modifiable */, 0x0e /* 0x7a : not user-modifiable */,
  0x0e /* 0x7b : not user-modifiable */, 0x00 /* 0x7c : not user-modifiable */, 0x00 /* 0x7d : not user-modifiable */, 0x02 /* 0x7e : not user-modifiable */, 0xc7 /* 0x7f : ROI center, use SetROI() */, 0xff /* 0x80 : XY ROI (X=Width, Y=Height), use SetROI() */, 0x9b /* 0x81 : not user-modifiable */, 0x00 /* 0x82 : not user-modifiable */, 0x00 /* 0x83 : not user-modifiable */, 0x00 /* 0x84 : not user-modifiable */, 0x01 /* 0x85 : not user-modifiable */,
  0x01 /* 0x86 : clear interrupt, use ClearInterrupt() */, 0x40 /* 0x87 : start ranging, use StartRanging() or StopRanging(), If you want an automatic start after VL53L1X_init() call, put 0x40 in location 0x87 */,
]

const status_rtn = [255, 255, 255, 5, 2, 4, 1, 7, 3, 0, 255, 255, 9, 13, 255, 255, 255, 255, 10, 6, 255, 255, 11, 12]

export const VL53L1X_GetSWVersion = () => ({
  major: 3,
  minor: 3,
  build: 0,
  revision: 0,
})

const VL53L1_WrByte = async (dev: any, reg: number, data: number) => {
  await dev.writeByte(reg, data)
}

const VL53L1_RdByte = async (dev: any, reg: number): Promise<number> => {
  const byte = await dev.readByte(reg)
  return byte
}

const VL53L1_WrWord = async (dev: any, reg: number, data: number) => {
  await dev.writeWord(reg, data)
}

const VL53L1_RdWord = async (dev: any, reg: number): Promise<number> => {
  const word = await dev.readWord(reg)
  return word
}

const VL53L1_WrDWord = async (dev: any, reg: number, data: number) => {
  await dev.writeDWord(reg, data)
}

const VL53L1_RdDWord = async (dev: any, reg: number): Promise<number> => {
  const dword = await dev.readDWord(reg)
  return dword
}

const VL53L1_ReadMulti = async (dev: any, reg: any, length: any) => dev.readMulti(reg, length)

const VL53L1X_BootState = async (dev: any): Promise<boolean> => {
  const state = await VL53L1_RdByte(dev, REG.FIRMWARE__SYSTEM_STATUS)
  return state === 0x03
}

const VL53L1X_ClearInterrupt = async (dev: any) => {
  await VL53L1_WrByte(dev, REG.SYSTEM__INTERRUPT_CLEAR, 0x01)
}

const VL53L1X_SensorInit = async (dev: any) => {
  for (let i = 0; i < VL51L1X_DEFAULT_CONFIGURATION.length; i++) {
    await VL53L1_WrByte(dev, REG.SYSTEM__MODE_START + i, VL51L1X_DEFAULT_CONFIGURATION[i])
  }
  await VL53L1X_ClearInterrupt(dev)
}

const VL53L1X_StartRanging = async (dev: any) => {
  await VL53L1_WrByte(dev, REG.SYSTEM__MODE_START, 0x40)
}

const VL53L1X_StopRanging = async (dev: any) => {
  await VL53L1_WrByte(dev, REG.SYSTEM__MODE_START, 0x00)
}

const VL53L1X_CheckForDataReady = async (dev: any, polarity: any): Promise<boolean> => {
  const intPol = await VL53L1_RdByte(dev, REG.GPIO__TIO_HV_STATUS)
  return (intPol & 0x01) === 0x01
}

const VL53L1X_GetDistance = async (dev: any): Promise<number> => {
  const distance = await VL53L1_RdWord(dev, REG.RESULT__FINAL_CROSSTALK_CORRECTED_RANGE_MM_SD0)
  return distance
}

const VL53L1X_SetDistanceMode = async (dev: any, mode: number) => {
  let timingBudget: number
  switch (mode) {
    case 1:
      timingBudget = 20
      break
    case 2:
      timingBudget = 33
      break
    case 3:
      timingBudget = 50
      break
    default:
      timingBudget = 100
      break
  }
  await VL53L1_WrByte(dev, REG.RANGE_CONFIG__TIMEOUT_MACROP_A_HI, timingBudget)
}

const VL53L1X_SetTimingBudgetInMs = async (dev: any, timingBudget: number) => {
  await VL53L1_WrWord(dev, REG.SYSTEM__INTERMEASUREMENT_PERIOD, timingBudget)
}

const VL53L1X_GetTimingBudgetInMs = async (dev: any): Promise<number> => {
  const timingBudget = await VL53L1_RdWord(dev, REG.SYSTEM__INTERMEASUREMENT_PERIOD)
  return timingBudget
}

const VL53L1X_SetInterMeasurementInMs = async (dev: any, intermeasurement: number) => {
  await VL53L1_WrWord(dev, REG.SYSTEM__INTERMEASUREMENT_PERIOD, intermeasurement)
}

const VL53L1X_GetInterMeasurementInMs = async (dev: any): Promise<number> => {
  const intermeasurement = await VL53L1_RdWord(dev, REG.SYSTEM__INTERMEASUREMENT_PERIOD)
  return intermeasurement
}

const VL53L1X_SetROI = async (dev: any, x: number, y: number) => {
  await VL53L1_WrByte(dev, REG.ROI_CONFIG__USER_ROI_CENTRE_SPAD, x)
  await VL53L1_WrByte(dev, REG.ROI_CONFIG__USER_ROI_REQUESTED_GLOBAL_XY_SIZE, y)
}

const VL53L1X_GetROI_XY = async (dev: any): Promise<{ x: number; y: number }> => {
  const x = await VL53L1_RdByte(dev, REG.ROI_CONFIG__USER_ROI_CENTRE_SPAD)
  const y = await VL53L1_RdByte(dev, REG.ROI_CONFIG__USER_ROI_REQUESTED_GLOBAL_XY_SIZE)
  return { x, y }
}

const VL53L1X_SetSignalThreshold = async (dev: any, threshold: number) => {
  await VL53L1_WrWord(dev, REG.SYSTEM__THRESH_HIGH, threshold)
}

const VL53L1X_GetSignalThreshold = async (dev: any): Promise<number> => {
  const threshold = await VL53L1_RdWord(dev, REG.SYSTEM__THRESH_HIGH)
  return threshold
}

const VL53L1X_SetSigmaThreshold = async (dev: any, threshold: number) => {
  await VL53L1_WrWord(dev, REG.SYSTEM__THRESH_LOW, threshold)
}

const VL53L1X_GetSigmaThreshold = async (dev: any): Promise<number> => {
  const threshold = await VL53L1_RdWord(dev, REG.SYSTEM__THRESH_LOW)
  return threshold
}

const VL53L1X_StartMeasurement = async (dev: any) => {
  await VL53L1X_ClearInterrupt(dev)
  await VL53L1X_StartRanging(dev)
}

const VL53L1X_StopMeasurement = async (dev: any) => {
  await VL53L1X_StopRanging(dev)
}

const VL53L1X_GetOffset = async (dev: any) => {
  let Temp = await VL53L1_RdWord(dev, REG.ALGO__PART_TO_PART_RANGE_OFFSET_MM)
  Temp = Temp << 3
  Temp = Temp >> 5
  return Temp
}

const VL53L1X_GetInterruptPolarity = async (dev: any) => {
  const polarity = await VL53L1_RdByte(dev, REG.GPIO_HV_MUX__CTRL)
  return (polarity & 0x10) === 0x10 ? 0 : 1
}

const VL53L1X_GetResult = async (dev: any) => {
  const Temp = await VL53L1_ReadMulti(dev, REG.RESULT__RANGE_STATUS, 17)
  let RgSt = Temp[0] & 0x1f

  if (RgSt < 24) {
    RgSt = status_rtn[RgSt]
  }

  return {
    status: RgSt,
    ambient: Temp.readUInt16BE(7) * 8,
    numSPADs: Temp[3],
    sigPerSPAD: Temp.readUInt16BE(15) * 8,
    distance: Temp.readUInt16BE(13),
  }
}

const VL53L1X_SetOffset = async (dev: any, OffsetValue: number) => {
  await VL53L1_WrWord(dev, REG.ALGO__PART_TO_PART_RANGE_OFFSET_MM, OffsetValue * 4)
  await VL53L1_WrWord(dev, REG.MM_CONFIG__INNER_OFFSET_MM, 0x0)
  await VL53L1_WrWord(dev, REG.MM_CONFIG__OUTER_OFFSET_MM, 0x0)
}

const VL53L1X_SetXtalk = async (dev: any, XtalkValue: any) => {
  /* XTalkValue in count per second to avoid float type */
  await VL53L1_WrWord(dev, REG.ALGO__CROSSTALK_COMPENSATION_X_PLANE_GRADIENT_KCPS, 0x0000)
  await VL53L1_WrWord(dev, REG.ALGO__CROSSTALK_COMPENSATION_Y_PLANE_GRADIENT_KCPS, 0x0000)
  /* * << 9 (7.9 format) and /1000 to convert cps to kpcs */
  await VL53L1_WrWord(dev, REG.ALGO__CROSSTALK_COMPENSATION_PLANE_OFFSET_KCPS, (XtalkValue << 9) / 1000)
}

const VL53L1X_GetSpadNb = async (dev: any) => {
  return (await VL53L1_RdWord(dev, REG.RESULT__DSS_ACTUAL_EFFECTIVE_SPADS_SD0)) >> 8
}

const VL53L1X_GetSignalRate = async (dev: any) => {
  return (await VL53L1_RdWord(dev, REG.RESULT__PEAK_SIGNAL_COUNT_RATE_CROSSTALK_CORRECTED_MCPS_SD0)) * 8
}

export {
  VL53L1X_BootState,
  VL53L1X_ClearInterrupt,
  VL53L1X_SensorInit,
  VL53L1X_StartRanging,
  VL53L1X_StopRanging,
  VL53L1X_CheckForDataReady,
  VL53L1X_GetDistance,
  VL53L1X_SetDistanceMode,
  VL53L1X_SetTimingBudgetInMs,
  VL53L1X_GetTimingBudgetInMs,
  VL53L1X_SetInterMeasurementInMs,
  VL53L1X_GetInterMeasurementInMs,
  VL53L1X_SetROI,
  VL53L1X_GetROI_XY,
  VL53L1X_SetSignalThreshold,
  VL53L1X_GetSignalThreshold,
  VL53L1X_SetSigmaThreshold,
  VL53L1X_GetSigmaThreshold,
  VL53L1X_StartMeasurement,
  VL53L1X_StopMeasurement,
  VL53L1X_GetOffset,
  VL53L1X_GetInterruptPolarity,
  VL53L1X_GetResult,
  VL53L1X_SetOffset,
  VL53L1X_SetXtalk,
  VL53L1X_GetSpadNb,
  VL53L1X_GetSignalRate,
}
