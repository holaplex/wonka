import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { YogaLogger } from 'graphql-yoga';

/**
 * Logger for logging to log files and console.
 */
export class WonkaLogger implements YogaLogger {
    public readonly logger: winston.Logger;
    public readonly id: string | undefined;

    private constructor(logger: winston.Logger, id?: string) {
        this.logger = logger;
        this.id = id;
    }


    /**
     * Make a standard logger. For logs made for a specific request/unique
     * instance, create a derivative logger using `withIdentifier`
     *
     * @param name name of the logger; becomes the filename in the logging directory
     * @returns new logger
     */
    public static with(name: string): WonkaLogger {
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.File({
                    filename: `./logs/${name}.log`,
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
        return new WonkaLogger(logger);
    }


    /**
     * @returns new logger with unique identifier that will be written to logs
     */
    public withIdentifier(): WonkaLogger {
        return new WonkaLogger(this.logger, uuidv4());
    }


    public debug(message: string, error?: Error): void {
        this.logger.debug(message, this.buildMetadata(error));
    }


    public info(message: string, error?: Error): void {
        this.logger.info(message, this.buildMetadata(error));
    }


    public warn(message: string, error?: Error): void {
        this.logger.warn(message, this.buildMetadata(error));
    }


    public error(message: string, error?: Error): void {
        this.logger.error(message, this.buildMetadata(error));
    }


    private buildMetadata(error?: Error): LogMetadata {
        return {
            id: this.id,
            error: error === undefined ? undefined : {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        }
    }
}


interface LogMetadata {
    id?: string,
    error?: {
        name: string,
        message: string,
        stack: string
    }
}
