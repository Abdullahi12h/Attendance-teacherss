const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { processRFIDScan } = require('../controllers/rfidController');

let port = null;
let parser = null;
let ioInstance = null;

const SerialPortService = {
  /**
   * Initializes the Serial Port listener
   * @param {Object} io - Socket.IO instance for real-time broadcasts
   */
  init(io) {
    ioInstance = io;
    const portName = process.env.SERIAL_PORT;
    const baudRate = parseInt(process.env.SERIAL_BAUD || '9600');

    if (!portName) {
      console.log('[Serial] No SERIAL_PORT configured in .env. Skipping hardware listener initialization.');
      return;
    }

    try {
      console.log(`[Serial] Connecting to Arduino on port ${portName} at ${baudRate} baud...`);
      port = new SerialPort({
        path: portName,
        baudRate: baudRate,
        autoOpen: true
      });

      parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      port.on('open', () => {
        console.log(`[Serial] Port ${portName} opened successfully.`);
      });

      port.on('error', (err) => {
        console.error(`[Serial] Error opening/operating port ${portName}:`, err.message);
      });

      // Parse incoming serial data
      parser.on('data', async (line) => {
        line = line.trim();
        if (!line) return;

        console.log(`[Serial] Received line: "${line}"`);

        // Check if message is a card scan
        if (line.startsWith('UID:')) {
          const rfidUid = line.substring(4).trim().toUpperCase();
          await handleCardScan(rfidUid);
        }
      });

    } catch (err) {
      console.error('[Serial] Critical initialization failure:', err.message);
    }
  },

  /**
   * Sends a response line back to the Arduino RFID terminal
   * @param {string} message - Response message (e.g. OK:Name:Time, DUP:Msg, ERR:Reason)
   */
  writeToArduino(message) {
    if (port && port.isOpen) {
      port.write(message + '\n', (err) => {
        if (err) {
          console.error('[Serial] Error writing to Arduino:', err.message);
        } else {
          console.log(`[Serial] Sent reply: "${message}"`);
        }
      });
    } else {
      console.warn('[Serial] Write attempted but port is closed/not initialized.');
    }
  }
};

/**
 * Validates, records attendance, and sends serial response using shared controller logic
 * @param {string} rfidUid - Hexadecimal card UID
 */
async function handleCardScan(rfidUid) {
  try {
    const result = await processRFIDScan(rfidUid, ioInstance);

    if (!result.success) {
      SerialPortService.writeToArduino(`ERR:${result.message}`);
    } else if (result.duplicate) {
      SerialPortService.writeToArduino(`DUP:${result.studentName}`);
    } else {
      SerialPortService.writeToArduino(`OK:${result.studentName}:${result.time}`);
    }
  } catch (err) {
    console.error('[Serial] Error handling RFID card scan:', err.message);
    SerialPortService.writeToArduino("ERR:Server Error");
  }
}

module.exports = SerialPortService;
