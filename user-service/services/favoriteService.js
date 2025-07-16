const favoriteModel = require('../models/favoriteModel');
const userModel = require('../models/userModel');
const { ServiceError } = require('../errors/customErrors');
const logger = require('../loaders/logger');

const addFavorite = async (userId, matchId) => {
    try{
        logger.info("Service: adding favorite to user", {userId});

        const result = await favoriteModel.addFavorite(userId, matchId);
        return result;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to add favorite to user',
            error: error.message,
            stack: error.stack,
            inputData: { userId, matchId }
        });
        throw new ServiceError(error.message);
    }
};

const getFavorites = async (userId) => {
    try{
        logger.info('Service: Finding user', {userId});
        const user = await userModel.findUserById(userId);
        if (user == [])
            throw new ServiceError('User not found');

        logger.info('Service: Fetching favorite of user', {userId});
        const result = await favoriteModel.getFavoritesByUserId(userId);
        return result;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to fetch favorite of user',
            error: error.message,
            stack: error.stack,
            inputData: { userId }
        });
        throw new ServiceError(error.message);
    }
};

module.exports = {
  addFavorite,
  getFavorites,
};
