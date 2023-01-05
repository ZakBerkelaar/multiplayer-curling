import { Game } from "../../../common/game.js";
import { ShootingCue } from "../shooting_cue.js";
import { Renderer } from "./renderer.js";

export class CueRenderer implements Renderer {
    cue: ShootingCue;

    constructor(cue: ShootingCue) {
        this.cue = cue;
    }

    render(context: CanvasRenderingContext2D, game: Game): void {
        context.fillStyle = 'black';
        context.strokeStyle = 'black';
        
        context.beginPath();
        context.moveTo(this.cue.start.x, this.cue.start.y);
        context.lineTo(this.cue.end.x, this.cue.end.y);
        context.stroke();
    }
}