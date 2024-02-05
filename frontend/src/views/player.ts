import { SocketConnection } from './websockets';
import { userStore } from '../stores/user';

import blue_upflap from "@/public/skins/0-upflap.png";
import blue_midflap from "@/public/skins/0-midflap.png";
import blue_downflap from "@/public/skins/0-downflap.png";

import red_upflap from "@/public/skins/1-upflap.png";
import red_midflap from "@/public/skins/1-midflap.png";
import red_downflap from "@/public/skins/1-downflap.png";

import yellow_upflap from "@/public/skins/2-upflap.png";
import yellow_midflap from "@/public/skins/2-midflap.png";
import yellow_downflap from "@/public/skins/2-downflap.png";


export class Player {
    x: number;
    y: number;

    sizeX: number;
    sizeY: number;

    acceleration: number;
    velocity: number;

    spriteUpFlap: HTMLImageElement;
    spriteMidFlap: HTMLImageElement;
    spriteDownFlap: HTMLImageElement;
    sprite: HTMLImageElement;

    lastTimeJumped: number;

    playerId: number;

    nickname: string;
    
    angle: number;
    hitbox: boolean;

    score: number;

    dead: boolean;

    keyDown: boolean;

    webSocket: SocketConnection | null;
 
    constructor(nickname: string, id : number | null = null, skinId:number) {
        const user = userStore();

        if (id) {
            this.playerId = id;
        }
        else{
            this.playerId = user.id as number;
        }

        this.nickname = nickname;

        this.x = -200;
        this.y = 0;
        this.angle = Math.PI/2;

        this.sizeX = 34;
        this.sizeY = 24;

        this.acceleration = 1200;
        this.velocity = 0;

        this.spriteUpFlap = new Image();
        this.spriteMidFlap = new Image();
        this.spriteDownFlap = new Image();
        this.loadSprites(skinId);

        this.lastTimeJumped = 0;

        this.sprite = this.spriteMidFlap;

        this.hitbox = false;
        this.score  = 0;
        
        this.dead = false;

        this.keyDown = false;

        this.webSocket = null;
    }

    loadSprites(skinId:number): void {
        if (skinId === 0) {
            this.spriteUpFlap.src = blue_upflap;
            this.spriteMidFlap.src = blue_midflap;
            this.spriteDownFlap.src = blue_downflap;
        }
        else if (skinId === 1) {
            this.spriteUpFlap.src = red_upflap;
            this.spriteMidFlap.src = red_midflap;
            this.spriteDownFlap.src = red_downflap;
        }
        else if (skinId === 2) {
            this.spriteUpFlap.src = yellow_upflap;
            this.spriteMidFlap.src = yellow_midflap;
            this.spriteDownFlap.src = yellow_downflap;
        }
    }

    connect(): void {
        this.webSocket = SocketConnection.getInstance();
    }

    update(dt:number): void {
        // if (this.dead) return;

        this.y += this.velocity * dt;
        this.velocity += this.acceleration * dt;

        if (this.y > 250 - this.sizeY) {
            this.y = 250 - this.sizeY;
            this.velocity = 0;
        }
        else if (this.y < -250 ) {
            this.y = -250 ;
            this.velocity = 0;
        }

    }

    jump():void{
        if (this.webSocket){
            this.webSocket.sendJump(this.y);
        }

        this.lastTimeJumped = Date.now();
        this.velocity = -400
    }

    animation(): void {
        if (Date.now() - this.lastTimeJumped < 100) {
            this.sprite = this.spriteUpFlap;
        } else if (Date.now() - this.lastTimeJumped < 200) {
            this.sprite = this.spriteMidFlap;
        } else if (Date.now() - this.lastTimeJumped < 300) {
            this.sprite = this.spriteDownFlap;
        } else {
            this.sprite = this.spriteMidFlap;
        }
    }

    rotate(ctx:CanvasRenderingContext2D | null): void {
        ctx?.rotate(this.velocity/1000);
    }

    render(canvas:HTMLCanvasElement): void {

        const ctx = canvas.getContext('2d');
        this.animation();

        ctx?.save();

        ctx!.font = "20px Arial";
        ctx!.fillStyle = "black";
        ctx!.textAlign = "center";
        ctx?.fillText(this.nickname, this.x + this.sizeX/2, this.y - 30);


        ctx?.translate(this.x + this.sizeX, this.y + this.sizeY);
        this.rotate(ctx);
        ctx?.translate(-(this.x + this.sizeX), -(this.y + this.sizeY));


        ctx?.drawImage(this.sprite, this.x, this.y, this.sizeX, this.sizeY);
        ctx?.restore();


    }

    controls(): void {
        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp" && !this.keyDown) {
                this.keyDown = true;
              this.jump();
            }
          });
          window.addEventListener("keyup", (e) => {
            if (e.key === "ArrowUp") {
              this.keyDown = false;
            }
          });

    }

    reset(): void {
        
        this.x = -200;
        this.y = 0;
        this.angle = Math.PI/2;
    
        this.sizeX = 34;
        this.sizeY = 24;
    
        this.acceleration = 1200;
        this.velocity = 0;
    
        this.lastTimeJumped = 0;
    
        this.sprite = this.spriteMidFlap;
    
        this.hitbox = false;
        this.score  = 0;
        
        this.dead = false;
    }

    addScore(): void {
        this.score++;
        this.webSocket?.sendScore(this.score);
    }



  };


  