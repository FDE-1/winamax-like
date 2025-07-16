const db = require('../loaders/postgres');

exports.handleMatchEvent = async (io, userSocketMap, event) => {
    const { type, matchId, data } = event;

    let preferenceColumn;
    switch (type) {
        case 'match.started':   preferenceColumn = 'notify_on_start'; break;
        case 'match.goal':      preferenceColumn = 'notify_on_goal'; break;
        case 'match.finished':  preferenceColumn = 'notify_on_finish'; break;
        default:
            console.log(`Event type ${type} not handled.`);
            return;
    }

    /*Cas bet */
    if (type === 'bet.resolved') {
        const targetUserId = event.userId;
        const socketId = userSocketMap.get(targetUserId.toString());

        if (socketId) {
            io.to(socketId).emit(type, { ...event.data });
            console.log(`SUCCESS: Notification 'bet.resolved' sent to user ${targetUserId}`);
        } else {
            console.log(`INFO: User ${targetUserId} has a resolved bet but is not connected.`);
        }
        return;
    }

    /*Cas match */
    if (type.startsWith('match.')) {
        try {
            const query = `SELECT user_id FROM favorites WHERE match_id = $1;`;
            const { rows: subscribedUsers } = await db.query(query, [matchId]);

            subscribedUsers.forEach(user => {
                const socketId = userSocketMap.get(user.user_id.toString());
                if (socketId) {
                    io.to(socketId).emit(type, { matchId, ...data });
                }
            });
        } catch (error) {
            console.error("Error handling match event:", error);
        }
    }
};
