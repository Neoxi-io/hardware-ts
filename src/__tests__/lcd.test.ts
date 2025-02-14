import { LCD } from '../lcd';
import { openPromisified } from 'i2c-bus';
import * as sleep from 'sleep';

jest.mock('i2c-bus');
jest.mock('sleep');

describe('LCD', () => {
  let mockBus: any;
  let lcd: LCD;

  beforeEach(async () => {
    mockBus = await openPromisified(1);
    lcd = new LCD('TestLCD', mockBus, 0x27, 16, 2);
    await lcd.begin();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize the LCD', async () => {
    expect(mockBus.writeByte).toHaveBeenCalledTimes(10);
  });

  test('should clear the display', async () => {
    await lcd.clear();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x01);
  });

  test('should set cursor to home', async () => {
    await lcd.home();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x80);
  });

  test('should print a string on the first line', async () => {
    await lcd.print('Hello, World!', 0);
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x80);
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 'H'.charCodeAt(0));
  });

  test('should turn off the display', async () => {
    await lcd.noDisplay();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x08);
  });

  test('should turn on the display', async () => {
    await lcd.display();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x0C);
  });

  test('should turn on the cursor', async () => {
    await lcd.cursor();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x0E);
  });

  test('should turn off the cursor', async () => {
    await lcd.noCursor();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x0C);
  });

  test('should turn on blinking', async () => {
    await lcd.blink();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x0D);
  });

  test('should turn off blinking', async () => {
    await lcd.noBlink();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x0C);
  });

  test('should turn on the backlight', async () => {
    await lcd.backlight();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x08);
  });

  test('should turn off the backlight', async () => {
    await lcd.noBacklight();
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x00);
  });

  test('should create a custom character', async () => {
    const charmap = [0x00, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x0A, 0x00];
    await lcd.createChar(0, charmap);
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x40);
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0x00);
  });

  test('should set the cursor position', async () => {
    await lcd.setCursor(0, 1);
    expect(mockBus.writeByte).toHaveBeenCalledWith(0x27, 0, 0xC0);
  });
});
