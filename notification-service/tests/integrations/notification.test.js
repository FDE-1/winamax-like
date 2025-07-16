const kafka = require('../../loaders/kafka');
const { io } = require('socket.io-client');

const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
const TEST_TIMEOUT = 20000;

describe('Notification Service Integration Test', () => {
    let kafkaProducer;
    let socketClient;

    beforeAll(async () => {
        kafkaProducer = kafka.producer();
        await kafkaProducer.connect();

        socketClient = io(NOTIFICATION_URL, { transports: ['websocket'] });
        await new Promise(resolve => socketClient.on('connect', resolve));
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await kafkaProducer.disconnect();
        socketClient.disconnect();
    });

    test('devrait recevoir une notification de but après un événement Kafka', async () => {
        const userIdToNotify = 1;
        const matchId = 1;
        const goalData = { team: 'Team A', minute: 78 };

        socketClient.emit('authenticate', userIdToNotify);

        const notificationPromise = new Promise((resolve, reject) => {
            socketClient.on('match.goal', (data) => {
                try {
                    expect(data.matchId).toBe(matchId);
                    expect(data.team).toBe(goalData.team);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
            setTimeout(() => reject(new Error('Timeout: notification non reçue')), 10000);
        });

        await kafkaProducer.send({
            topic: 'match-events',
            messages: [{
                value: JSON.stringify({
                    type: 'match.goal',
                    matchId: matchId,
                    data: goalData,
                }),
            }],
        });

        await expect(notificationPromise).resolves.toBeDefined();
    }, TEST_TIMEOUT);
});
