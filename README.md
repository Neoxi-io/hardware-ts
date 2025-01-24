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

## A4988 Stepper Motor Driver

The A4988 is a microstepping driver for controlling bipolar stepper motors. It is designed to operate bipolar stepper motors in full, half, quarter, eighth, and sixteenth step modes.

### Usage

To use the A4988 stepper motor driver, you need to create an instance of the `A4988` class and call its methods to control the motor.

#### Example

```typescript
import { A4988 } from '@neoxi-io/hardware-ts'
import { MCP23017 } from '@neoxi-io/hardware-ts'
import PCA9685 from '@neoxi-io/hardware-ts'
import { openPromisified } from 'i2c-bus'

async function main() {
  const bus = await openPromisified(1)
  const gpio = new MCP23017(bus, 0x20)
  const pwm = new PCA9685(50, 1.0, 0x40, bus)

  const stepper = new A4988(gpio, pwm, 0, 1, 2)

  await stepper.setDirection(true)
  await stepper.enable()

  for (let i = 0; i < 200; i++) {
    await stepper.setStep(true)
    await stepper.setStep(false)
  }

  await stepper.disable()
}

main().catch(console.error)
```

### Methods

- `setStep(step: boolean)`: Controls the step signal of the stepper motor.
- `setDirection(direction: boolean)`: Controls the direction signal of the stepper motor.
- `enable()`: Enables the stepper motor.
- `disable()`: Disables the stepper motor.

## DRV8825 Stepper Motor Driver

The DRV8825 is a microstepping driver for controlling bipolar stepper motors. It is designed to operate bipolar stepper motors in full, half, quarter, eighth, sixteenth, and thirty-second step modes.

### Usage

To use the DRV8825 stepper motor driver, you need to create an instance of the `DRV8825` class and call its methods to control the motor.

#### Example

```typescript
import { DRV8825 } from '@neoxi-io/hardware-ts'
import { MCP23017 } from '@neoxi-io/hardware-ts'
import PCA9685 from '@neoxi-io/hardware-ts'
import { openPromisified } from 'i2c-bus'

async function main() {
  const bus = await openPromisified(1)
  const gpio = new MCP23017(bus, 0x20)
  const pwm = new PCA9685(50, 1.0, 0x40, bus)

  const stepper = new DRV8825(gpio, pwm, 0, 1, 2)

  await stepper.setDirection(true)
  await stepper.enable()

  for (let i = 0; i < 200; i++) {
    await stepper.setStep(true)
    await stepper.setStep(false)
  }

  await stepper.disable()
}

main().catch(console.error)
```

### Methods

- `setStep(step: boolean)`: Controls the step signal of the stepper motor.
- `setDirection(direction: boolean)`: Controls the direction signal of the stepper motor.
- `enable()`: Enables the stepper motor.
- `disable()`: Disables the stepper motor.

## BME280 Sensor

The BME280 is a combined digital humidity, pressure, and temperature sensor based on proven sensing principles. It is designed for low power consumption and high precision.

### Usage

To use the BME280 sensor, you need to create an instance of the `BME280` class and call its methods to read the sensor data.

#### Example

```typescript
import { BME280 } from '@neoxi-io/hardware-ts'
import { openPromisified } from 'i2c-bus'

async function main() {
  const bus = await openPromisified(1)
  const sensor = new BME280(bus, 'tempID', 'pressureID', 'humidityID')

  await sensor.init()

  const temperature = await sensor.readTemperature()
  console.log(`Temperature: ${temperature} °C`)

  const pressure = await sensor.readPressure()
  console.log(`Pressure: ${pressure} hPa`)

  const humidity = await sensor.readHumidity()
  console.log(`Humidity: ${humidity} %`)
}

main().catch(console.error)
```

### Methods

- `init()`: Initializes the BME280 sensor.
- `readTemperature()`: Reads the temperature value from the sensor.
- `readPressure()`: Reads the pressure value from the sensor.
- `readHumidity()`: Reads the humidity value from the sensor.

## SHT4X Sensor

The SHT4X is a digital temperature and humidity sensor with high accuracy and low power consumption.

### Usage

To use the SHT4X sensor, you need to create an instance of the `SHT4X` class and call its methods to read the sensor data.

#### Example

```typescript
import { SHT4X } from '@neoxi-io/hardware-ts'
import { openPromisified } from 'i2c-bus'

async function main() {
  const bus = await openPromisified(1)
  const sensor = new SHT4X(bus, 'tempID', 'humidityID')

  const temperature = await sensor.temperature()
  console.log(`Temperature: ${temperature} °C`)

  const humidity = await sensor.relativeHumidity()
  console.log(`Humidity: ${humidity} %`)
}

main().catch(console.error)
```

### Methods

- `temperature()`: Reads the temperature value from the sensor.
- `relativeHumidity()`: Reads the relative humidity value from the sensor.

## SGP30 Sensor

The SGP30 is a digital gas sensor for indoor air quality monitoring.

### Usage

To use the SGP30 sensor, you need to create an instance of the `SGP30` class and call its methods to read the sensor data.

#### Example

```typescript
import { SGP30 } from '@neoxi-io/hardware-ts'
import { openPromisified } from 'i2c-bus'

async function main() {
  const bus = await openPromisified(1)
  const sensor = new SGP30(bus, 'tvocID', 'eco2ID', 'ethanolID', 'hydrogenID', 'airQualityID')

  sensor.start()

  setInterval(() => {
    const data = sensor.get()
    console.log(`TVOC: ${data.tvocID} ppb`)
    console.log(`eCO2: ${data.eco2ID} ppm`)
    console.log(`Ethanol: ${data.ethanolID} ppm`)
    console.log(`Hydrogen: ${data.hydrogenID} ppm`)
    console.log(`Air Quality: ${data.airQualityID}`)
  }, 1000)
}

main().catch(console.error)
```

### Methods

- `start()`: Starts the sensor measurements.
- `stop()`: Stops the sensor measurements.
- `get()`: Returns the sensor data.
- `stop()`: Stops the sensor measurements.
- `get()`: Returns the sensor data.
