export class SocketConnection {
    private static instance: SocketConnection;
    public webSocket: WebSocket;
    public id: number;
    public roomId: number;

    private constructor(id:number) {
        this.id = id;
        this.roomId = 1;
        this.webSocket = new WebSocket(`ws://localhost:8000/ws/${this.roomId}/${this.id}`);
        
        this.webSocket.onopen = () => {
            this.sendJoin();
        }
    }

    public static getInstance(id:number): SocketConnection {
        if (!SocketConnection.instance) {
            SocketConnection.instance = new SocketConnection(id);
        }

        return SocketConnection.instance;
    }

    private send(message: any) {
        message.id = this.id;
        this.webSocket.send(JSON.stringify(message));
    }

    private sendJoin() {
        this.send({type: "join"});
    }

    public sendJump(posY: number) {
        this.send({type: "jump", y: Math.round(posY*10)/10});
    }

    public sendScore(score: number) {
        this.send({type: "score", score: score});
    }

    public sendDead() {
        this.send({type: "dead"});
    }
}