import { Player } from "./player";
import { Pipe } from "./pipe";
import { SocketConnection } from "./websockets";
import backgroundImage from "@/public/background-day.png";
import { playersStore } from "@/stores/players";
import { userStore } from "@/stores/user";
import { Random } from "@/utils/random";
import { RenderEngine } from "./renderEngine";

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

    stopRendering: boolean;

    lastFrame: number;
    lag: number;


    renderEngine: RenderEngine;

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
            this.userStore.id,
            this.userStore.skinId
        );

        this.lastFrame = 0;
        this.lag = 0;

        this.stopRendering = false;

        this.websocket = SocketConnection.getInstance();
        this.listenOnSocket();
        
        this.mainPlayer.connect();
       
        this.playersStore.addPlayer({id: this.mainPlayer.playerId, nickname: this.mainPlayer.nickname, score: 0});

        this.renderEngine = new RenderEngine(canvas);

        this.renderEngine.addLayer({
            renderFunction: () => this.renderBackground(canvas),
            zIndex: 0,
            key: "background"
        })

        this.renderEngine.addLayer({
            renderFunction: () => this.renderPlayers(),
            zIndex: 2,
            key: "players"
        })

        this.renderEngine.addLayer({
            renderFunction: () => this.renderPipes(),
            zIndex: 1,
            key: "pipes"
        })

        this.renderEngine.addLayer({
            renderFunction: () => this.renderScore(canvas),
            zIndex: 3,
            key: "score"
        })

        this.init();

    }

    input(): void {
        this.mainPlayer.controls();
    }

    gameLoop() : void{
      requestAnimationFrame(this.gameLoop.bind(this));
      this.update();
      this.renderEngine.render();
      this.input();
    }

    listenOnSocket(): void {
        
      if (!this.websocket) return;

       this.websocket.webSocket.onmessage = (event) => { 
        const data = JSON.parse(event.data);


        switch (data.type) {
          case "join":
            console.log("join", data.skinId);
            if (data.id !== this.mainPlayer.playerId) {
              this.players?.push(new Player( data.nickname, data.id, data.skinId));
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
                player.y = data.y;
                player.jump();
              }
            });
          break;

          case "dead":
            this.players?.forEach((player) => {
              if (player.playerId === data.id) {
                player.dead = true;
              }
            });
          break;
            case "win":
            Random.seed(data.newSeed);
            this.playersStore.addScore(data.id);
            this.reset();
        break;
  }
}

  }

    renderBackground(canvas: HTMLCanvasElement) {
      // ctx?.drawImage(this.sprite, this.x, this.y, this.sizeX, this.sizeY);

        const ctx = canvas.getContext("2d");

        ctx?.save();

        for (let i = 0; i < canvas.width / 288 + 1; i++) {
          ctx?.drawImage(
            background,
            -canvas.width / 2 + i * 288,
            -canvas.height / 2,
            288,
            512,
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
      
      }

    
    renderPlayers(): void {
    
      const players =  [...this.players!, this.mainPlayer];
      players.forEach((player) => player.render(this.canvas));
      
    }

    renderPipes(): void {
      this.pipes.forEach((pipe) => pipe.render(this.canvas));
    }


    addPipe(): number {
        return setInterval(() => {
            this.pipes.push(new Pipe(this.canvas, 2000));
            }, 2000);
      }
    
    animationStart():void {

        // get ready to start the game

        const ctx = this.canvas.getContext('2d');
        if (!ctx || !this.canvas) return;

        const height = 150;
        let current = 3;



        this.renderEngine.addLayer({
          renderFunction: () => {
            ctx.fillStyle = "black";
            ctx.fillRect(-this.canvas.width/2, -height/2 - 5, this.canvas.width, height+10);
            ctx.fillStyle = "white";
            ctx.fillRect(-this.canvas.width/2, -height/2, this.canvas.width, height);
          },
          zIndex: 99,
          key: "startAnimation"
        });

        ctx.font = "bold 48px sans-serif";
        
        this.renderEngine.addLayer({
        
        renderFunction: () => {ctx.fillStyle = "black";ctx.fillText(current.toString(), 0, 10);},
          zIndex: 100,
          key: "startAnimation"
        });

        const interval = setInterval(() => {
          current--;
          if (current === 0) {
            clearInterval(interval);
            this.renderEngine.removeLayer("startAnimation");
          }
        }, 500);
    }

    init(): void {


      for (let i = 1 ; i < 11; i++)
      {
          this.pipes.push(new Pipe(this.canvas, 200 * i ));
      }

      this.stopRendering = true;
      this.renderEngine.addLayer({
        renderFunction: () => this.animationStart(),
        zIndex: 10,
        key: "animation",
        callOnce: true,
      })

      setTimeout(() => {
        this.timeouts.push(this.addPipe());
        this.stopRendering = false;
      }
      , 1500);

    }

    reset(): void {
      const players =  [...this.players!, this.mainPlayer];

        players.forEach((player) => player!.reset());


        this.pipes = [];

        this.timeouts.forEach((timeout) => clearTimeout(timeout));
        
        this.init();
    }

    update(): void {
        if (this.stopRendering) return;
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
          if (pipe.collide(this.mainPlayer, this.canvas) && !this.mainPlayer.dead) {
            this.mainPlayer.dead = true;
            this.mainPlayer.webSocket?.sendDead();
            break;
          } else if (pipe.x < this.mainPlayer.x && !pipe.passed) {
            pipe.passed = true;
            this.mainPlayer.addScore();
          }
        }

      }
}