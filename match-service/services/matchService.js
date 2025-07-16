const matchModel = require('../models/matchModel');
const { ServiceError } = require('../errors/customErrors');
const logger = require('../loaders/logger');

const getAllMatch = async () => {
    try {
        logger.info('Service: Fetching all matches from database');
        const matches = await matchModel.getAllMatch();
        logger.info('Service: Successfully retrieved all matches', { count: matches.length });
        return matches;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to fetch all matches',
            error: error.message,
            stack: error.stack
        });
        throw new ServiceError(error.message);
    }
}

const createMatch = async (team1, team2, start_time) => {
    try {
        logger.info('Service: Creating new match', { team1, team2, start_time });
        const newMatch = await matchModel.insertMatch(team1, team2, start_time);
        logger.info('Service: Successfully created match', { matchId: newMatch.id });
        return newMatch;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to create match',
            error: error.message,
            stack: error.stack,
            inputData: { team1, team2, start_time }
        });
        throw new ServiceError(error.message);
    }
}

const deleteMatch = async (id) => {
    try {
        logger.info('Service: Deleting match', {
            matchId: id
        });
        const deletedMatch = await matchModel.deleteMatch(id);
        logger.info('Service: Successfully deleted match', { matchId: id });
        return deletedMatch;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to delete match',
            error: error.message,
            stack: error.stack,
            matchId: id
        });
        throw new ServiceError(error.message);
    }
};

const updateMatch = async (id, { team1, team2, start_time, status, goals_team1, goals_team2 }) => {
    try {
        logger.info('Service: Updating match', {
            matchId: id,
            updateData: { team1, team2, start_time, status, goals_team1, goals_team2 }
        });
        const updatedMatch = await matchModel.updateMatch(id, { team1, team2, start_time, status, goals_team1, goals_team2 });
        logger.info('Service: Successfully updated match', { matchId: id });
        return updatedMatch;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to update match',
            error: error.message,
            stack: error.stack,
            matchId: id,
            updateData: { team1, team2, start_time, status, goals_team1, goals_team2 }
        });
        throw new ServiceError(error.message);
    }
}

const upComingMatch = async () => {
    try {
        logger.info('Service: Fetching upcoming matches');
        const matches = await matchModel.upComingMatch();
        logger.info('Service: Successfully retrieved upcoming matches', { count: matches.length });
        return matches;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to fetch upcoming matches',
            error: error.message,
            stack: error.stack
        });
        throw new ServiceError(error.message);
    }
}

const getLiveMatch = async () => {
    try {
        logger.info('Service: Fetching live matches');
        const matches = await matchModel.getLiveMatch();
        logger.info('Service: Successfully retrieved live matches', { count: matches.length });
        return matches;
    }
    catch (error) {
        logger.error({
            message: 'Service: Failed to fetch live matches',
            error: error.message,
            stack: error.stack
        });
        throw new ServiceError(error.message);
    }
}

module.exports = {
    getAllMatch,
    createMatch,
    deleteMatch,
    updateMatch,
    upComingMatch,
    getLiveMatch
}
