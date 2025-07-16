const pool = require('../loaders/postgres');
const logger = require('../loaders/logger');
const { PostgresError, ServiceError } = require('../errors/customErrors');


const addFavorite = async (userId, matchId) => {
    try {
        logger.info('Model: Adding favorite', { userId, matchId });

        const {rows} = await pool.query(
            `INSERT INTO favorites (user_id, match_id) VALUES (${userId}, ${matchId}) RETURNING *`
        );
        return rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to add favorite',
            error: error.message,
            stack: error.stack,
            inputData: { userId, matchId }
        });
        throw new PostgresError(error.message);
    }
}


const getFavoritesByUserId = async (userId) => {
    try {
        logger.info('Model: Fetching favorite', { userId });

        const {rows} = await pool.query(
            'SELECT match_id FROM favorites WHERE user_id = $1',
            [userId]
        );
        return rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to fetch favorite',
            error: error.message,
            stack: error.stack,
            inputData: { userId }
        });
        throw new PostgresError(error.message);
    }
}

module.exports = {
  addFavorite,
  getFavoritesByUserId,
};
