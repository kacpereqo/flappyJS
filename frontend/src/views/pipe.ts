import pipeImg from '../public/game/pipe-green.png';
import reversedPipeImg from '../public/game/pipe-green-reversed.png';
import { Player } from './player';

export class Pipe{
    x: number;
    y: number;

    sizeX: number;
    sizeY: number;

    passed: boolean;

    pipeImg: HTMLImageElement;
    reversedPipeImg: HTMLImageElement;

    constructor() {
        this.x = 250;
        this.y = Math.floor(Math.random() * 200);

        this.sizeX = 52;
        this.sizeY = 320;

        this.pipeImg = new Image();
        this.pipeImg.src = pipeImg;

        this.passed = false;

        this.reversedPipeImg = new Image();
        this.reversedPipeImg.src = reversedPipeImg;
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
        return this.x < -250 - this.sizeX;
    }

    collide(player: Player){
        if (player.x + player.sizeX/2 > this.x && player.x < this.x + this.sizeX) {
            if (player.y+player.sizeY > this.y || player.y < this.y - 200) {
                return true;
            }
        }
        return false;
    }
}