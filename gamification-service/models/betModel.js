const pool = require('../loaders/postgres');

const createBet = async (userId, matchId, prediction) => {
    const query = `
        INSERT INTO bets (user_id, match_id, prediction)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, matchId, prediction]);
    console.log(rows);
    return rows[0];
};

const findBetsByUser = async (userId) => {
    const query = 'SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC;';

    const { rows } = await pool.query(query, [userId]);
    return rows;
};

const resolveBetsForMatch = async (bet_id, result) => {

    const winningPrediction = result.winner;

    await pool.query(
        `UPDATE bets SET status = 'won' WHERE bet_id = $1 AND prediction = $2 AND status = 'pending';`,
        [bet_id, winningPrediction]
    );

    await pool.query(
        `UPDATE bets SET status = 'lost' WHERE bet_id = $1 AND prediction != $2 AND status = 'pending';`,
        [bet_id, winningPrediction]
    );
    console.log(`Bets resolved for bet ${bet_id}`);
};

module.exports = {
    createBet,
    findBetsByUser,
    resolveBetsForMatch
}
