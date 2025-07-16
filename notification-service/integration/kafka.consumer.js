const kafka = require('../loaders/kafka');
const NotificationService = require('../services/notificationService');

/*Récupère les notification */
exports.start = async (io, userSocketMap) => {
    const consumer = kafka.consumer({ groupId: 'notification-group' });

    try {
        await consumer.connect();
        await consumer.subscribe({ topics: ['match-events', 'notification-events'], fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const messageValue = message.value.toString();
                console.log(`[KAFKA] Received message: ${messageValue}`);

                try {
                    const event = JSON.parse(messageValue);

                    await NotificationService.handleMatchEvent(io, userSocketMap, event);

                } catch (parseError) {
                    console.error(`[KAFKA] Failed to parse message: ${messageValue}`, parseError);
                }
            },
        });
    } catch (error) {
        console.error("[KAFKA] Consumer failed to start or run:", error);
        process.exit(1);
    }
};
