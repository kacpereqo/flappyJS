import pipeImg from '@/public/pipe-green.png';
import reversedPipeImg from '@/public/pipe-green-reversed.png';
import { Player } from './player';
import { Random } from '@/utils/random';

export class Pipe{
    x: number;
    y: number;

    sizeX: number;
    sizeY: number;

    passed: boolean;

    pipeImg: HTMLImageElement;
    reversedPipeImg: HTMLImageElement;
    canvas : HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement, posX : number | null = null) {
        this.sizeX = 52;
        this.sizeY = 320;

        this.y = Random.random(0, 200);
        if (posX) {
            this.x = posX;
        }
        else{
            this.x = 2000;
        }

        this.pipeImg = new Image();
        this.pipeImg.src = pipeImg;

        this.passed = false;

        this.reversedPipeImg = new Image();
        this.reversedPipeImg.src = reversedPipeImg;

        this.canvas = canvas;
    }

    update(dt: number): void {
        this.x -= 100 * dt;
    }

    render(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d');

        ctx?.drawImage(this.pipeImg, this.x, this.y, this.sizeX, this.sizeY)
        ctx?.drawImage(this.reversedPipeImg, this.x, -320 + this.y - 200, this.sizeX, this.sizeY)
        
    }

    isOutOfScreen(): boolean {
        return this.x < -this.canvas.width/2  - this.sizeX;
    }

    collide(player: Player, canvas: HTMLCanvasElement): boolean {
        if (player.x + player.sizeX > this.x && player.x < this.x + this.sizeX) {
            if (player.y+player.sizeY > this.y || player.y < this.y - 200  ) {
                return true;
            }
        }
        return false;
    }
}