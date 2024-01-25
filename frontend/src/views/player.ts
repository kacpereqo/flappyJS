import downflap from '../public/game/bluebird-downflap.png'
import midflap from '../public/game/bluebird-midflap.png'
import upflap from '../public/game/bluebird-upflap.png'

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
    
    angle: number;
    hitbox: boolean;

    score: number;

    dead: boolean;

    constructor() {
        this.x = -200;
        this.y = 0;
        this.angle = Math.PI/2;

        this.sizeX = 34;
        this.sizeY = 24;

        this.acceleration = 1200;
        this.velocity = 0;

        this.spriteUpFlap = new Image();
        this.spriteUpFlap.src = upflap;

        this.spriteMidFlap = new Image();
        this.spriteMidFlap.src = midflap;

        this.spriteDownFlap = new Image();
        this.spriteDownFlap.src = downflap;

        this.lastTimeJumped = 0;

        this.sprite = this.spriteMidFlap;

        this.hitbox = false;
        this.score  = 0;
        
        this.dead = false;
    }

    update(dt:number): void {
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

        ctx?.translate(this.x + this.sizeX, this.y + this.sizeY);
        this.rotate(ctx);
        ctx?.translate(-(this.x + this.sizeX), -(this.y + this.sizeY));


        if (this.hitbox) {
            ctx?.fillRect(this.x, this.y, this.sizeX, this.sizeY);
        }
        ctx?.drawImage(this.sprite, this.x, this.y, this.sizeX, this.sizeY);
        ctx?.restore();
    }

    dead(): void{
        this.velocity = 0;
        this.acceleration = 0;
    }

    reset(): void {
        this.x = -200;
        this.y = 0;
        this.angle = Math.PI/2;
    
        this.sizeX = 34;
        this.sizeY = 24;
    
        this.acceleration = 1200;
        this.velocity = 0;
    
        this.spriteUpFlap = new Image();
        this.spriteUpFlap.src = upflap;
    
        this.spriteMidFlap = new Image();
        this.spriteMidFlap.src = midflap;
    
        this.spriteDownFlap = new Image();
        this.spriteDownFlap.src = downflap;
    
        this.lastTimeJumped = 0;
    
        this.sprite = this.spriteMidFlap;
    
        this.hitbox = false;
        this.score  = 0;
        
        this.dead = false;
    }

  };


  