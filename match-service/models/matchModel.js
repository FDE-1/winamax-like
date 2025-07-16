const pool = require('../loaders/postgres');
const redis = require('../loaders/redis');
const logger = require('../loaders/logger');
const { PostgresError, ServiceError } = require('../errors/customErrors');

const getAllMatch = async () => {
    try {
        logger.info('Model: Checking cache for all matches');
        const cached = await redis.get('all_matchs');
        if (cached) {
            logger.info('Model: Retrieved all matches from cache');
            return JSON.parse(cached);
        }

        logger.info('Model: Querying database for all matches');
        const { rows } = await pool.query('SELECT * FROM matchs ORDER BY id DESC');
        await redis.set('all_matchs', JSON.stringify(rows), 'EX', 60);
        logger.info('Model: Successfully retrieved all matches from database and updated cache', { count: rows.length });
        return rows;
    } catch (error) {
        logger.error({
            message: 'Model: Failed to get all matches',
            error: error.message,
            stack: error.stack
        });
        throw new PostgresError(error.message);
    }
}

const insertMatch = async (team1, team2, start_time) => {
    try {
        const current_time = new Date();
        logger.info('Model: Inserting new match', { team1, team2, start_time });

        await redis.del('all_matches');
        logger.debug('Model: Cleared all_matches cache');

        const { rows } = await pool.query(
            'INSERT INTO matchs (team1, team2, start_time, status, goals_team1, goals_team2, create_at, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [team1, team2, start_time, 'NOT STARTED', 0, 0, current_time, current_time]
        );

        await redis.set(`matchs:${rows[0].id}`, JSON.stringify(rows[0]));
        logger.info('Model: Successfully inserted new match and updated cache', { matchId: rows[0].id });
        return rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to insert match',
            error: error.message,
            stack: error.stack,
            inputData: { team1, team2, start_time }
        });
        throw new PostgresError(error.message);
    }
}

const updateMatch = async (id, { team1, team2, start_time, status, goals_team1, goals_team2 }) => {
    try {
        logger.info('Model: Updating match', { matchId: id, updateData: { team1, team2, start_time, status, goals_team1, goals_team2 } });

        var { rows } = await pool.query('SELECT * FROM matchs WHERE id=$1', [id]);
        if (rows.length == 0) {
            logger.warn('Model: Match not found for update', { matchId: id });
            throw new PostgresError("Not able to find match with id:" + id);
        }

        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (team1) {
            fields.push(`team1 = $${paramIndex++}`);
            values.push(team1);
        }
        if (team2) {
            fields.push(`team2 = $${paramIndex++}`);
            values.push(team2);
        }
        if (start_time) {
            fields.push(`start_time = $${paramIndex++}`);
            values.push(start_time);
        }
        if (status) {
            fields.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (goals_team1) {
            fields.push(`goals_team1 = $${paramIndex++}`);
            values.push(goals_team1);
        }
        if (goals_team2) {
            fields.push(`goals_team2 = $${paramIndex++}`);
            values.push(goals_team2);
        }

        if (fields.length == 0) {
            logger.warn('Model: No valid fields provided for update', { matchId: id });
            throw new ServiceError("No valid fields provided for update.");
        }

        fields.push(`last_updated = $${paramIndex}`);
        values.push(new Date());

        const query = `UPDATE matchs SET ${fields.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`;
        values.push(id);

        const updated = await pool.query(query, values);
        const updatedMatch = updated.rows[0];

        await redis.del('all_matchs');
        await redis.set(`matchs:${id}`, JSON.stringify(updatedMatch));
        logger.info('Model: Successfully updated match and cache', { matchId: id });

        return updatedMatch;
    } catch (error) {
        logger.error({
            message: 'Model: Failed to update match',
            error: error.message,
            stack: error.stack,
            matchId: id,
            updateData: { team1, team2, start_time, status, goals_team1, goals_team2 }
        });
        throw new PostgresError(error.message);
    }
}

const deleteMatch = async (id) => {
    try {
        logger.info('Model: Deleting match', { matchId: id });

        await redis.del(`matchs:${id}`);
        await redis.del('all_matchs');
        logger.debug('Model: Cleared relevant cache entries');

        const { rows } = await pool.query('DELETE FROM matchs WHERE id = $1 RETURNING *', [id]);

        if (rows.length === 0) {
            logger.warn('Model: Match not found for deletion', { matchId: id });
            throw new PostgresError("Match not found with id: " + id);
        }

        logger.info('Model: Successfully deleted match', { matchId: id });
        return rows[0];
    } catch (error) {
        logger.error({
            message: 'Model: Failed to delete match',
            error: error.message,
            stack: error.stack,
            matchId: id
        });
        throw new PostgresError(error.message);
    }
}

const upComingMatch = async () => {
    try {
        logger.info('Model: Checking cache for upcoming matches');
        const cached = await redis.get('upcoming_matchs');
        if (cached) {
            logger.info('Model: Retrieved upcoming matches from cache');
            return JSON.parse(cached);
        }

        const current = new Date();
        logger.info('Model: Querying database for upcoming matches');
        const { rows } = await pool.query(
            "SELECT * FROM matchs WHERE start_time AT TIME ZONE 'UTC' > $1 AT TIME ZONE 'UTC' and status = $2 ORDER BY start_time ASC",
            [current, "NOT STARTED"]
        );

        await redis.set('upcoming_matchs', JSON.stringify(rows), 'EX', 60);
        logger.info('Model: Successfully retrieved upcoming matches from database and updated cache', { count: rows.length });
        return rows;
    } catch (error) {
        logger.error({
            message: 'Model: Failed to get upcoming matches',
            error: error.message,
            stack: error.stack
        });
        throw new PostgresError(error.message);
    }
}

const getLiveMatch = async () => {
    try {
        logger.info('Model: Checking cache for live matches');
        const cached = await redis.get('live_matchs');
        if (cached) {
            logger.info('Model: Retrieved live matches from cache');
            return JSON.parse(cached);
        }

        logger.info('Model: Querying database for live matches');
        const { rows } = await pool.query("SELECT * FROM matchs WHERE status = 'Live' ORDER BY start_time ASC");

        await redis.set('live_matchs', JSON.stringify(rows), 'EX', 60);
        logger.info('Model: Successfully retrieved live matches from database and updated cache', { count: rows.length });
        return rows;
    } catch (error) {
        logger.error({
            message: 'Model: Failed to get live matches',
            error: error.message,
            stack: error.stack
        });
        throw new PostgresError(error.message);
    }
}

module.exports = {
    getAllMatch,
    insertMatch,
    updateMatch,
    deleteMatch,
    upComingMatch,
    getLiveMatch
}
