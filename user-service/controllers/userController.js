const userService = require('../services/userService');
const logger = require('../loaders/logger');

const register = async (req, res) => {
    /*Crée un utilsiteur */
    const { email, password } = req.body;
    try {
        logger.info('Registering');
        const user = await userService.register(email, password);
        logger.info('Successfully register');
        res.status(200).json(user);
    }
    catch(error){
        logger.error({
            message: 'Error registering',
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error_type: error.type || 'InternalServerError',
            message: error.message
        });
    }
}

const login = async (req, res) => {
    /*Enregistrement */
    const { email, password } = req.body;
    try {
        logger.info('Login');
        const user = await userService.login(email, password);
        logger.info('Successfully logged');
        res.status(200).json(user);
    }
    catch(error){
        logger.error({
            message: 'Error loging',
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error_type: error.type || 'InternalServerError',
            message: error.message
        });
    }
}

module.exports = {
    register,
    login
}
