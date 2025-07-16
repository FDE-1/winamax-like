const betModel = require('../models/betModel');

const createBet = async (userId, matchId, prediction) => {
    const bet  = await betModel.createBet(userId, matchId, prediction);
    return bet;
};

const findBetsByUser = async (userId) => {
    const bets = await betModel.findBetsByUser(userId);
    return bets;
};

const resolveBetsForMatch = async (matchId, result) => {
    await betModel.resolveBetsForMatch(matchId, result);
};

module.exports = {
    createBet,
    findBetsByUser,
    resolveBetsForMatch
}
