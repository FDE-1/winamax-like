const logger = require('../loaders/logger');

class CustomError extends Error {
    constructor(message, name = "CustomError", statusCode = 500) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
        logger.error({
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            stack: this.stack
        }, 'CustomError occurred');
    }
}

class RedisError extends CustomError {
    constructor(message = "Redis operation failed") {
        super(message, "RedisError", 502);
        logger.error({
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            stack: this.stack
        }, 'RedisError occurred');
    }
}

class PostgresError extends CustomError {
    constructor(message = "PostgreSQL operation failed") {
        super(message, "PostgresError", 500);
        logger.error({
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            stack: this.stack
        }, 'PostgresError occurred');
    }
}

class LoaderError extends CustomError {
    constructor(message = "Failed to load required resource") {
        super(message, "LoaderError", 500);
        logger.error({
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            stack: this.stack
        }, 'LoaderError occurred');
    }
}

class ServiceError extends CustomError {
    constructor(message = "Service encountered an error") {
        super(message, "ServiceError", 503);
        logger.error({
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            stack: this.stack
        }, 'ServiceError occurred');
    }
}

class ControllerError extends CustomError {
    constructor(message = "Service encountered an error") {
        super(message, "ControllerError", 503);
        logger.error({
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            stack: this.stack
        }, 'ControllerError occurred');
    }
}

module.exports = {
    CustomError,
    RedisError,
    PostgresError,
    LoaderError,
    ServiceError,
    ControllerError
};
