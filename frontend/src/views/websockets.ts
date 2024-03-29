import { websocketStore } from "../stores/websocket";
import { userStore } from "../stores/user";
import { playersStore } from "@/stores/players";


export class SocketConnection {
    
    private static instance: SocketConnection|  null = null;
    public webSocket: WebSocket;
    public userStore: any;
    private playersStore: any; 

    private constructor() {


        const store = websocketStore();
        this.userStore = userStore();
        this.playersStore = playersStore();

        this.webSocket = new WebSocket(store.getAdress());
        
        this.webSocket.onopen = () => {
            this.sendJoin();
        }
    
        window.addEventListener("popstate", () => {
            this.webSocket.close();
            this.playersStore.reset();
            SocketConnection.instance = null;
        });
    }

    public static getInstance(): SocketConnection {
        if (!SocketConnection.instance) {
            SocketConnection.instance = new SocketConnection();
        }

        return SocketConnection.instance;
    }

    private send(message: any) {
        message.id = this.userStore.id;
        this.webSocket.send(JSON.stringify(message));
    }

    private sendJoin() {
        this.send({type: "join", nickname: this.userStore.nickname, skinId: this.userStore.skinId});
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