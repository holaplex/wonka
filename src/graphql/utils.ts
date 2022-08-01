import { uuid as uuidv4, isUuid } from 'uuidv4';
import path from 'path';
import winston from 'winston';
import fs from 'fs/promises';

const LOGS_DIR = path.resolve('.', 'logs');

import { CACHE_PATH, EXTENSION_JSON } from '../../cli/helpers/constants.js';

export const getProcessLogger = async () => {
  const processId = uuidv4();
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { processId },
    transports: [
      new winston.transports.File({
        filename: `${LOGS_DIR}/${processId}.txt`,
      }),
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }

  return {
    logger: logger,
    processId: processId,
  };
};
