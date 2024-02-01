import { Player } from "./player";
import { Pipe } from "./pipe";
import { SocketConnection } from "./websockets";
import backgroundImage from "@/public/game/background-day.png";
import { playersStore } from "@/stores/players";

const background = new Image();
background.src = backgroundImage;

export class Engine{

    dt: number;
    clock: number

    mainPlayer: Player;
    players: Player[] | null;
    pipes: Pipe[];

    timeouts: any[];
    canvas: HTMLCanvasElement;
    websocket: SocketConnection | null;

    playersStore: any;

    constructor(canvas: HTMLCanvasElement){
        this.dt = 1/60;
        this.clock = 0;

        this.players = [];
        this.pipes = [];
        this.timeouts = [];
        this.canvas = canvas;
        this.mainPlayer = new Player();

        this.websocket = SocketConnection.getInstance();
        this.listenOnSocket();
        
        this.mainPlayer.connect();
       
        this.playersStore = playersStore();
        this.playersStore.addPlayer(this.mainPlayer);
    }

    input(): void {
        this.mainPlayer.controls();
    }

    gameLoop() : void{ {
        this.init();
        setInterval(() => {
                this.clock += this.dt;
                this.update();
                this.render();
                this.input();
            }, 1000 / 120);
          }
    }

    listenOnSocket(): void {
      const chatContainer = document.getElementById("chat-container");
      const chat = document.getElementById("chat");
        
      if (!this.websocket) return;
      if (!chat) return;

       this.websocket.webSocket.onmessage = (event) => { 
        const data = JSON.parse(event.data);

        chat.innerHTML += `<li>${data.id}: ${data.type}</li>`;
        chatContainer

        if (data.type === "join") {
          if (data.id !== this.mainPlayer.playerId) {
            const newPlayer = new Player(data.id, data.nickname);
            
            this.players?.push(newPlayer);
            this.playersStore.addPlayer(newPlayer);
        }
       }
       if  (data.type === "disconnect") { 
        this.players?.forEach((player) => {
          if (player.playerId === data.id) {

            this.players?.splice(this.players.indexOf(player), 1);
            this.playersStore.removePlayer(data.id);
          }
        });
       }
       if (data.type === "jump") {
        this.players?.forEach((player) => {
          if (player.playerId === data.id) {
            player.jump();
          }
        });
      }
      if (data.type === "dead") {
        this.reset();
      }
    }
  }

    renderBackground(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        for (let i = 0; i < canvas.width / 288 + 1; i++) {
          ctx?.drawImage(
            background,
            0,
            0,
            canvas.width,
            canvas.height,
            (i - 1) * 287 + ((this.clock * 20) % 288),
            0,
            canvas.width,
            canvas.height
          );
        }
      }
      
    renderScore(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx || !canvas) return;

        ctx.font = "bold 48px sans-serif";
        ctx.fillStyle = "white";
        ctx.fillText(this.mainPlayer.score.toString(), 0, -canvas.height / 2 + 50);
        // ctx.fillText(this.players.length.toString(), 0, -canvas.height / 2 + 50);
      
        ctx?.translate(-canvas.width / 2, -canvas.height / 2);
      }

    render(): void {
        const ctx = this.canvas.getContext("2d");
        if (!ctx || !this.canvas) return;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
        this.renderBackground(this.canvas);
      
        ctx?.translate(this.canvas.width / 2, this.canvas.height / 2);
      
        // @ts-ignore
        const players =  [...this.players, this.mainPlayer];
        
        players.forEach((player) => player.render(this.canvas));
        this.pipes.forEach((pipe) => pipe.render(this.canvas));
      
        this.renderScore(this.canvas);
      }
    addPipe(): any {
        return setInterval(() => {
            this.pipes.push(new Pipe(this.canvas));
            }, 2000);
      }
    
    init(): void {
        this.timeouts.push(this.addPipe());
    }

    reset(): void {
        
      const players =  [...this.players, this.mainPlayer];

        players.forEach((player) => player.reset());

        this.pipes = [];
        this.timeouts.forEach((timeout) => clearTimeout(timeout));
        
        this.init();
    }

    update(): void {

        // --- Player --- //

        // @ts-ignore
        const players =  [...this.players, this.mainPlayer];

        for (const player of players) {
            player.update(this.dt);
        }


        // --- Pipes --- // 
        for (const pipe of this.pipes) {
            pipe.update(this.dt);
            if (pipe.isOutOfScreen()) {
                this.pipes.splice(this.pipes.indexOf(pipe), 1);
            }
        }
      
        // --- Player Collision--- //
        for (const pipe of this.pipes) {
          if (pipe.collide(this.mainPlayer, this.canvas)) {
            this.mainPlayer.webSocket?.sendDead();
            this.reset();
            break;
          } else if (pipe.x < this.mainPlayer.x && !pipe.passed) {
            pipe.passed = true;
            this.mainPlayer.addScore();
          }
        }

      }
}