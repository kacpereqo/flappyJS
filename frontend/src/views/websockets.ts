import { websocketStore } from "../stores/websocket";
import { userStore } from "../stores/user";
import { useRoute } from "vue-router";
import {watch } from 'vue';


export class SocketConnection {
    
    private static instance: SocketConnection|  null = null;
    public webSocket: WebSocket;
    public userStore: any;

    private constructor() {

        console.log("constructor");

        const store = websocketStore();
        this.userStore = userStore();
        this.webSocket = new WebSocket(store.getAdress());
        
        this.webSocket.onopen = () => {
            this.sendJoin();
            SocketConnection.instance = null;
        }
    
        window.addEventListener("popstate", () => {
            this.webSocket.close();
            console.log("closed");
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
        console.log(this.userStore.nickname);
        this.send({type: "join", nickname: this.userStore.nickname});
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