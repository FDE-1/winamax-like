const { Server } = require('socket.io');

/*Map */
const userSocketMap = new Map();

module.exports = (httpServer) => {
    const io = new Server(httpServer, { cors: { origin: "*" } });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        /*Authentification */
        socket.on('authenticate', (userId) => {
            if (!userId) return;
            console.log(`[AUTH] User ${userId} authenticated on socket ${socket.id}`);
            userSocketMap.set(userId.toString(), socket.id);
        });

        /*Deconnection et nettoyage map */
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            for (let [userId, id] of userSocketMap.entries()) {
                if (id === socket.id) {
                    userSocketMap.delete(userId);
                    console.log(`[AUTH] Removed user ${userId} from socket map.`);
                    break;
                }
            }
        });

    });

    return { io, userSocketMap };
};
