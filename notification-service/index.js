const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const { io, userSocketMap } = require('./loaders/socket')(server);

const kafkaConsumer = require('./integration/kafka.consumer');
kafkaConsumer.start(io, userSocketMap);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Notification service (Express + WebSocket) running on port ${PORT}`);
});