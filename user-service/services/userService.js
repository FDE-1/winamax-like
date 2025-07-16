const userModel = require('../models/userModel');
const { ServiceError } = require('../errors/customErrors');
const logger = require('../loaders/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const register = async (email, password) => {
    try {
        logger.info('Service: Searching for existing user', {email});
        const existing = await userModel.findUserByEmail(email);
        if (existing == [])
            throw new ServiceError('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);

        logger.info('Service: Registering new user', { email, hashedPassword });
        const newUser = await userModel.createUser(email, hashedPassword);
        logger.info('Service: Successfully created user', { userId: newUser.id });
        return newUser;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to register user',
            error: error.message,
            stack: error.stack,
            inputData: { email, password }
        });
        throw new ServiceError(error.message);
    }
};

const login = async (email, password) => {
    try {
        logger.info('Service: Searching for existing user', {email});
        const user = await userModel.findUserByEmail(email);
        if (user == [])
            throw new ServiceError('User not found');
        logger.info('Service: Matching password for user', {email, password});
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new ServiceError('Password not corresponding');

        logger.info('Service: Creating token');
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1d',
        });
        return { token };
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to login',
            error: error.message,
            stack: error.stack,
            inputData: { email, password }
        });
        throw new ServiceError(error.message);
    }
};

module.exports = {
    register,
    login
}
