const favoriteService = require('../services/favoriteService');
const logger = require('../loaders/logger');
const { ControllerError } = require('../errors/customErrors');

const addFavorite = async (req, res) => {
    /*Ajout un favoris a utisateur */
    const { userId, matchId } = req.body;
    try{
        logger.info("Controller: adding favorite to user", {userId});
        const favorite = await favoriteService.addFavorite(userId, matchId);
        res.status(200).json(favorite);
    }
    catch (error) {
        logger.error({
            message: 'Controller: Failed to add favorite to user',
            error: error.message,
            stack: error.stack,
            inputData: { userId, matchId }
        });
        throw new ControllerError(error.message);
    }
};


const getFavorites = async (req, res) => {
    /*Récupère les favoris */
    const { userId } = req.body;
    try{
        const favorite = await favoriteService.getFavorites(userId);
        res.status(200).json(favorite);
    }
    catch (error) {
        logger.error({
            message: 'Controller: Failed to fetch favorite of user',
            error: error.message,
            stack: error.stack,
            inputData: { userId }
        });
        throw new ControllerError(error.message);
    }
};

module.exports = {
  addFavorite,
  getFavorites,
};
