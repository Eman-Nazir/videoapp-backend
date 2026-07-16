import winston from "winston";
import fs from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json() //  ensures file logs are valid JSON, not "undefined"
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),

    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),

    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        consoleFormat
      ),
    }),
  ],
});

export default logger;