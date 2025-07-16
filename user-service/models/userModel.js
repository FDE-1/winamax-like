const pool = require('../loaders/postgres');
const logger = require('../loaders/logger');
const { PostgresError } = require('../errors/customErrors');

const createUser = async (email, hashedPassword) => {
    try {
        logger.info('Model: Inserting new user', { email, hashedPassword });

        const {rows} = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
            [email, hashedPassword]
        );
        return rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to insert new user',
            error: error.message,
            stack: error.stack,
            inputData: { email, hashedPassword }
        });
        throw new PostgresError(error.message);
    }
}

const deleteUser = async (email, hashedPassword) => {
    try {
        logger.info('Model: Deleting user', { email, hashedPassword });

        const result = await pool.query(
            'DELETE FROM users WHERE email = $1 and password = $2 RETURNING *',
            [email, hashedPassword]
        );
        return result.rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to delete user',
            error: error.message,
            stack: error.stack,
            inputData: { email, hashedPassword }
        });
        throw new PostgresError(error.message);
    }
}

const findUserByEmail = async (email) => {
    try {
        logger.info('Model: Finding user', { email });
        const {rows} = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to find user',
            error: error.message,
            stack: error.stack,
            inputData: { email }
        });
        throw new PostgresError(error.message);
    }
}

const findUserById = async (id) => {
    try {
        logger.info('Model: Finding user', { id });

        const result = await pool.query(
            'SELECT id, email FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to find user',
            error: error.message,
            stack: error.stack,
            inputData: { id }
        });
        throw new PostgresError(error.message);
    }
}

module.exports = {
    createUser,
    deleteUser,
    findUserByEmail,
    findUserById
}
