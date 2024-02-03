import { Player } from "./player";
import { Pipe } from "./pipe";
import { SocketConnection } from "./websockets";
import backgroundImage from "@/public/game/background-day.png";
import { playersStore } from "@/stores/players";
import { userStore } from "@/stores/user";
import { Random } from "@/utils/random";

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
    userStore: any;

    constructor(canvas: HTMLCanvasElement){
        this.dt = 1/60;
        this.clock = 0;

        this.playersStore = playersStore();
        this.userStore = userStore();

        this.players = [];
        this.pipes = [];
        this.timeouts = [];
        this.canvas = canvas;
        this.mainPlayer = new Player(
            this.userStore.nickname,
            this.userStore.id
        );

        this.websocket = SocketConnection.getInstance();
        this.listenOnSocket();
        
        this.mainPlayer.connect();
       
        this.playersStore.addPlayer({id: this.mainPlayer.playerId, nickname: this.mainPlayer.nickname, score: 0});
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
        
      if (!this.websocket) return;

       this.websocket.webSocket.onmessage = (event) => { 
        const data = JSON.parse(event.data);


        switch (data.type) {
          case "join":
            console.log(data);
            if (data.id !== this.mainPlayer.playerId) {
              this.players?.push(new Player( data.nickname, data.id));
              this.playersStore.addPlayer({id: data.id, nickname: data.nickname, score: data.score ? data.score : 0});
            }
          break;

          case "disconnect":
            this.players?.forEach((player) => {
              if (player.playerId === data.id) {

                this.players?.splice(this.players.indexOf(player), 1);
                this.playersStore.removePlayer(data.id);
              }
            });
          break;

          case "jump":
            this.players?.forEach((player) => {
              if (player.playerId === data.id) {
                player.jump();
              }
            });
          break;

          case "dead":
          Random.seed(data.newSeed);
          this.reset();
        break;

        case "win":
          console.log(data);
          console.log(this.playersStore.players);
          this.playersStore.addScore(data.id);
        break;
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
    addPipe(): number {
        return setInterval(() => {
            this.pipes.push(new Pipe(this.canvas, 2000));
            }, 2000);
      }
    
    init(): void {
      Random.seed(0);

      for (let i = 1 ; i < 11; i++)
      {
          this.pipes.push(new Pipe(this.canvas, 200 * i ));
      }
      
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
            const newSeed = Math.floor(Math.random() * 100000);
            Random.seed(newSeed);
            this.mainPlayer.webSocket?.sendDead(newSeed);
            this.reset();
            break;
          } else if (pipe.x < this.mainPlayer.x && !pipe.passed) {
            pipe.passed = true;
            this.mainPlayer.addScore();
          }
        }

      }
}