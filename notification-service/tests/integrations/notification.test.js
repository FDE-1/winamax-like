const kafka = require('../../loaders/kafka');
const { io } = require('socket.io-client');

const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
const TEST_TIMEOUT = 20000;

describe('Notification Service Integration Test', () => {
    let kafkaProducer;
    let socketClient;

    beforeAll(async () => {
        console.log('Creating Kafka producer...');
        kafkaProducer = kafka.producer();

        console.log('Connecting Kafka...');
        await kafkaProducer.connect();

        console.log('Connecting WebSocket...');
        console.log(NOTIFICATION_URL);
        socketClient = io(NOTIFICATION_URL, { transports: ['websocket'] });

        await new Promise(resolve => {
            socketClient.on('connect', () => {
                console.log('WebSocket connected');
                resolve();
            });
        });

        console.log('Authenticating...');
        await new Promise((resolve, reject) => {
            socketClient.emit('authenticate', 1);
            socketClient.once('authenticated', () => {
                console.log('Authenticated!');
                resolve();
            });
            setTimeout(() => reject(new Error('Timeout: authentication non reçue')), 5000);
        });
    }, TEST_TIMEOUT);


    afterAll(async () => {
        await kafkaProducer.disconnect();
        socketClient.disconnect();
    });

    test('devrait recevoir une notification de but après un événement Kafka', async () => {
        const userIdToNotify = 1;
        const matchId = 1;
        const goalData = { team: 'Team A', minute: 78 };

        // S’abonner à match.goal AVANT d’envoyer l’événement Kafka
        const notificationPromise = new Promise((resolve, reject) => {
            socketClient.once('match.goal', (data) => {
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

        // Publier un événement Kafka
        await kafkaProducer.send({
            topic: 'match-events',
            messages: [{
                value: JSON.stringify({
                    type: 'match.goal',
                    matchId,
                    data: goalData,
                }),
            }],
        });

        await expect(notificationPromise).resolves.toBeDefined();
    }, TEST_TIMEOUT);
});
