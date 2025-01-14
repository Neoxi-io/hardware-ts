# hardware-ts
Repo of custom TS libs for a diversity of hardware components

## Installation
```npm install @neoxi-io/hardware-ts```

## AS5600 Sensor

The AS5600 is a contactless magnetic rotary position sensor with a high-resolution 12-bit output. It is designed for contactless potentiometer applications and can be used to measure angles with high precision.

### Usage

To use the AS5600 sensor, you need to create an instance of the `AS5600` class and call its methods to read the sensor data.

#### Example

```typescript
import { AS5600 } from '@neoxi-io/hardware-ts'
import { openPromisified } from 'i2c-bus'

async function main() {
  const bus = await openPromisified(1)
  const sensor = new AS5600(bus)

  const rawAngle = await sensor.readRawAngle()
  console.log(`Raw Angle: ${rawAngle}`)

  const angle = await sensor.readAngle()
  console.log(`Angle: ${angle}`)

  const magnetStatus = await sensor.readMagnetStatus()
  console.log(`Magnet Status: ${magnetStatus}`)

  const magnitude = await sensor.readMagnitude()
  console.log(`Magnitude: ${magnitude}`)
}

main().catch(console.error)
```

### Methods

- `readRawAngle()`: Reads the raw angle value from the sensor.
- `readAngle()`: Reads the processed angle value from the sensor.
- `readMagnetStatus()`: Reads the magnet status from the sensor.
- `readMagnitude()`: Reads the magnitude value from the sensor.
