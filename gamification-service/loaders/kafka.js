const { Kafka } = require('kafkajs');

/*Utiliser pour les notification */
const kafka = new Kafka({
  clientId: 'gamification-service',
  brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
});

module.exports = kafka;
