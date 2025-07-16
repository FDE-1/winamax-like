const BetService = require('../services/betService');
const kafka = require('../loaders/kafka');

const producer = kafka.producer();
producer.connect();
const placeBet = async (req, res) => {
    /*Cree un Bet */
    const {userId, matchId, prediction} = req.body;
    const bet = await BetService.createBet(userId, matchId, prediction);
    res.status(201).json(bet);
};

const getBetHistory = async (req, res) => {
    /*Recupère tous les bets de l'utilisateur*/
    const {user_id} = req.body;
    const bets = await BetService.findBetsByUser(user_id);
    res.status(200).json(bets);
};


const resolveBetsForMatch = async (matchId, result) => {
    /*Donne le résultat d'un match et change les bets et envoie notification */
    const findBetsQuery = `SELECT id, user_id, prediction FROM bets WHERE match_id = $1 AND status = 'pending';`;
    const { rows: pendingBets } = await db.query(findBetsQuery, [matchId]);

    if (pendingBets.length === 0) {
        console.log(`No pending bets found for match ${matchId}.`);
        return;
    }

    console.log(`Resolving ${pendingBets.length} bets for match ${matchId}...`);

    for (const bet of pendingBets) {
        const newStatus = (bet.prediction === result.winner) ? 'won' : 'lost';
        await BetService.resolveBetsForMatch(bet.id, newStatus)

        const notificationEvent = {
            type: 'bet.resolved',
            userId: bet.user_id,
            data: {
                betId: bet.id,
                matchId: parseInt(matchId),
                outcome: newStatus,
                prediction: bet.prediction,
            }
        };

        /*Envoie une notification */
        await producer.send({
            topic: 'notification-events',
            messages: [{ value: JSON.stringify(notificationEvent) }],
        });

        console.log(`Produced 'bet.resolved' event for user ${bet.user_id}`);
    }
};

module.exports = {
    placeBet,
    getBetHistory,
    resolveBetsForMatch
}
