const matchService = require('../services/matchService');
const logger = require('../loaders/logger');
const kafka = require('../loaders/kafka');
const pool = require('../loaders/postgres');

const producer = kafka.producer();
producer.connect();

const getAllMatch = async (req, res) => {
    /*Recupère les matchs */
    try {
        logger.info('Fetching all matches');
        const matchs = await matchService.getAllMatch();
        logger.info('Successfully fetched all matches');
        res.status(200).json(matchs);
    }
    catch(error){
        logger.error({
            message: 'Error fetching all matches',
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error_type: error.type || 'InternalServerError',
            message: error.message
        });
    }
}

const createMatch = async (req, res) => {
    /*Crée un match */
    const { team1, team2, start_time } = req.body;
    try {
        logger.info('Creating new match', { team1, team2, start_time });
        const match = await matchService.createMatch(team1, team2, start_time);
        logger.info('Successfully created match', { matchId: match.id });
        res.status(201).json(match);
    } catch (error) {
        logger.error({
            message: 'Error creating match',
            error: error.message,
            stack: error.stack,
            inputData: { team1, team2, start_time }
        });
        res.status(500).json({
            error_type: error.type || 'InternalServerError',
            message: error.message || 'Failed to create match',
        });
    }
};

const deleteMatch = async (req, res) => {
    /*Supprime un match */
    const { id } = req.body;
    try {
        logger.info('Deleting match', { id });
        const match = await matchService.deleteMatch(id);
        logger.info('Successfully deleted match', { matchId: match.id });
        res.status(200).json(match);
    } catch (error) {
        logger.error({
            message: 'Error deleting match',
            error: error.message,
            stack: error.stack,
            inputData: { id }
        });
        res.status(500).json({
            error_type: error.type || 'InternalServerError',
            message: error.message || 'Failed to delete match',
        });
    }
};

const updateMatch = async (req, res) => {
    /*Met a jour un match et envoie une notifiation */
    const { id, team1, team2, start_time, status, goals_team1, goals_team2 } = req.body;
    try {
        const matchBeforeUpdate = await pool.query('SELECT * FROM matchs WHERE id = $1', [id]);

        const updatedMatch = await matchService.updateMatch(id, { team1, team2, start_time, status, goals_team1, goals_team2 });
        logger.info('Successfully updated match', { matchId: id });

        if (updatedMatch.status !== matchBeforeUpdate.status) {
            const event = {
                type: 'match.statusChanged',
                matchId: updatedMatch.id,
                data: { newStatus: updatedMatch.status }
            };
            await producer.send({
                topic: 'match-events',
                messages: [{ value: JSON.stringify(event) }],
            });
            logger.info('Produced Kafka event: match.statusChanged', event);
        }

        if (updatedMatch.goals_team1 !== matchBeforeUpdate.goals_team1 || updatedMatch.goals_team2 !== matchBeforeUpdate.goals_team2) {
             const event = {
                type: 'match.goal',
                matchId: updatedMatch.id,
                data: {
                    score: `${updatedMatch.goals_team1} - ${updatedMatch.goals_team2}`
                }
            };
            await producer.send({
                topic: 'match-events',
                messages: [{ value: JSON.stringify(event) }],
            });
            logger.info('Produced Kafka event: match.goal', event);
        }

        res.status(200).json(updatedMatch);
    }
    catch(error){
        logger.error({ message: 'Error updating match', error: error.message, matchId: id });
        res.status(500).json({ message: error.message });
    }
};

const upComingMatch = async(req, res) => {
    /*Récupère les matchs a venir */
    try {
        logger.info('Fetching upcoming matches');
        const matchs = await matchService.upComingMatch();
        logger.info('Successfully fetched upcoming matches', { count: matchs.length });
        res.status(200).json(matchs);
    }
    catch (error){
        logger.error({
            message: 'Error fetching upcoming matches',
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error_type: error.type || 'InternalServerError',
            message: error.message
        });
    }
}

const getLiveMatch = async(req, res) => {
    /*Récupère les matchs lives */
    try {
        logger.info('Fetching live matches');
        const matchs = await matchService.getLiveMatch();
        logger.info('Successfully fetched live matches', { count: matchs.length });
        res.status(200).json(matchs);
    }
    catch (error){
        logger.error({
            message: 'Error fetching live matches',
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
    getAllMatch,
    createMatch,
    deleteMatch,
    updateMatch,
    upComingMatch,
    getLiveMatch
}
