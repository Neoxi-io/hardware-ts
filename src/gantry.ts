import debugFactory from 'debug'
import { DRV8825, ActuatorDirection } from './drv8825';
import { AS5600 } from './as5600';


export class Gantry {

    private stepper: DRV8825
    private encoder: AS5600
    private debug: debugFactory.Debugger
    private currentPos: number = 0 // in number of rotations, ie: how many times the encoder has rotated from the home position
    private registeredPositions: number[] = []
    private interval: NodeJS.Timeout | undefined
    private minPosition: number = 0
    private maxPosition: number = 0
    private tolerance: number = 0.1
    private homePosition: number = 0

    constructor(stepper: DRV8825, encoder: AS5600, debug: boolean = false) {
        this.debug = debugFactory('gantry')
        this.stepper = stepper
        this.encoder = encoder

        if (debug) {
            debugFactory.enable('gantry')
        }

        this.debug('Initializing Gantry')
    }

    public async init(): Promise<void> {
        await this.encoder.init()

        this.encoderInterval()
    }

    public async deinit(): Promise<void> {
        this.stopEncoderInterval()
    }

    public async setHomePosition(): Promise<void> {
        this.homePosition = this.currentPos
        this.debug('Home position set to current position:', this.homePosition)
    }

    public async registerPosition(): Promise<void> {
        this.debug('Registering position:', this.currentPos)
        this.registeredPositions.push(this.currentPos)
    }

    public async moveToPosition(position: number): Promise<void> {
        // position number is an integer representing the index of the position in the array
        if (position < 0 || position >= this.registeredPositions.length) {
            this.debug('Position out of bounds:', position)
            return
        }

        const target = this.registeredPositions[position]

        if (target > this.minPosition || target < this.maxPosition) {
            this.debug('Target out of bounds:', target)
            return
        }

        if (target > this.currentPos) {
            await this.stepper.setDirection(ActuatorDirection.DOWN)
            this.debug('Current position is less than target position')
        }

        if (target < this.currentPos) {
            await this.stepper.setDirection(ActuatorDirection.UP)
            this.debug('Current position is greater than target position')
        }

        if (target === this.currentPos) {
            this.debug('Already at target position:', target)
            return
        }

        this.debug('Moving to position:', target)

        await this.stepper.enable()

        await this.stepper.move()

        while (this.currentPos < target - this.tolerance || this.currentPos > target + this.tolerance) {
            await this.sleep(50)
        }

        await this.stepper.stop()

        await this.stepper.disable()

        this.debug('Arrived at position:', target)
    }

    public async goHome(): Promise<void> {
        if (this.homePosition > this.currentPos) {
            await this.stepper.setDirection(ActuatorDirection.DOWN)
            this.debug('Current position is less than home position')
        }

        if (this.homePosition < this.currentPos) {
            await this.stepper.setDirection(ActuatorDirection.UP)
            this.debug('Current position is greater than home position')
        }

        if (this.homePosition === this.currentPos) {
            this.debug('Already home')
            return
        }

        this.debug('Going home')

        await this.stepper.enable()

        await this.stepper.move()

        while (this.currentPos < this.homePosition - this.tolerance || this.currentPos > this.homePosition + this.tolerance) {
            await this.sleep(50)
        }

        await this.stepper.stop()

        await this.stepper.disable()

        this.debug('Arrived home')
    }

    public async moveToAngle(angle: number): Promise<void> {
        const target = angle / 360

        if (target < this.minPosition || target > this.maxPosition) {
            this.debug('Target out of bounds:', target)
            return
        }

        if (target > this.currentPos) {
            await this.stepper.setDirection(ActuatorDirection.DOWN)
            this.debug('Current position is less than target position')
        }

        if (target < this.currentPos) {
            await this.stepper.setDirection(ActuatorDirection.UP)
            this.debug('Current position is greater than target position')
        }

        if (target === this.currentPos) {
            this.debug('Already at target position:', target)
            return
        }

        this.debug('Moving to position:', target)

        await this.stepper.enable()

        await this.stepper.move()

        while (this.currentPos < target - this.tolerance || this.currentPos > target + this.tolerance) {
            await this.sleep(50)
        }

        await this.stepper.stop()

        await this.stepper.disable()

        this.debug('Arrived at position:', target)
    }

    public async move(direction: ActuatorDirection): Promise<void> {
        this.debug('Moving in direction:', direction)
        await this.stepper.setDirection(direction)
        await this.stepper.enable()
        await this.stepper.move()
    }

    public async stop(): Promise<void> {
        this.debug('Stopping')
        await this.stepper.stop()
        await this.stepper.disable()
    }

    public async getCurrentAngle(): Promise<number> {
        return await this.encoder.getAngle()
    }

    public async setMaxPosition(): Promise<void> {
        this.maxPosition = this.currentPos;
        this.debug('Max position set to current position:', this.maxPosition);
    }

    public async setMinPosition(): Promise<void> {
        this.minPosition = this.currentPos;
        this.debug('Min position set to current position:', this.minPosition);
    }

    private async encoderInterval(): Promise<void> {
        let previousAngle = await this.encoder.getAngle(); // Initialize with the current angle

        this.interval = setInterval(async () => {
            const currentAngle = await this.encoder.getAngle();
            let delta = currentAngle - previousAngle;

            // Handle rollover
            if (delta > 180) {
                // Moving backward across 0 (e.g., 350 -> 10)
                delta -= 360;
            } else if (delta < -180) {
                // Moving forward across 360 (e.g., 10 -> 350)
                delta += 360;
            }

            this.currentPos += delta / 360; // Update rotations
            previousAngle = currentAngle; // Update the previous angle for the next iteration

            // this.debug('Current position (rotations):', this.currentPos, 'Current angle:', currentAngle);
        }, 1); // 50ms interval
    }

    private stopEncoderInterval(): void {
        clearInterval(this.interval)
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

}