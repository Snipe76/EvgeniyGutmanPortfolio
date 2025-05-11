// sync.js
// WebSocket-based real-time sync

export const Sync = {
    socket: null,

    init(listId, stateManager) {
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${protocol}://${location.host}/ws/lists/${listId}`;
        this.socket = new WebSocket(url);

        this.socket.addEventListener('open', () => {
            // Optionally announce presence
            this.send({ type: 'join', listId });
        });

        this.socket.addEventListener('message', (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'listUpdate' && msg.list) {
                    stateManager.list = msg.list;
                    stateManager.notify();
                } else if (msg.type === 'collaborators' && msg.collaborators) {
                    stateManager.setCollaborators(msg.collaborators);
                }
            } catch (e) {
                console.error('Failed to parse message', e);
            }
        });

        this.socket.addEventListener('close', () => {
            console.warn('WebSocket closed, will not sync until reconnect');
        });

        this.socket.addEventListener('error', (err) => {
            console.error('WebSocket error', err);
        });
    },

    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }
}; 