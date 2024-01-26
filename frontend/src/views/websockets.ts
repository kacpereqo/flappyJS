export class SocketConnection {
    private static instance: SocketConnection;
    public webSocket: WebSocket;

    private constructor() { 
        this.webSocket = new WebSocket("ws://localhost:8000/ws/123/1");
    }

    public static getInstance(): SocketConnection {
        if (!SocketConnection.instance) {
            SocketConnection.instance = new SocketConnection();
        }

        return SocketConnection.instance;
    }

    private send(message: any) {
        this.webSocket.send(JSON.stringify({type: "message", message: message}));
    }

    public sendJump(posX: number) {
        this.send({type: "jump", posX: posX});
    }

    public sendScore(score: number) {
        this.send({type: "score", score: score});
    }
}