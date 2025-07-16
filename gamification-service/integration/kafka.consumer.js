const kafka = require('../loaders/kafka');
const BetService = require('../services/betService');

const consumer = kafka.consumer({ groupId: 'gamification-group' });

exports.start = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'match-events' });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            if (event.type === 'match.finished') {
                console.log(`Resolving bets for match ${event.matchId}`);
                await BetService.resolveBetsForMatch(event.matchId, event.result);
            }
        },
    });
};
