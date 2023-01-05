import { Vec2 } from "../../common/vec2.js";
import { getCanvasMouseLocation } from "./client_events.js";

export class ShootingCue {
    start: Vec2;
    end: Vec2;

    shoot: (vel: Vec2) => void;
    move: (pos: Vec2) => void;

    static readonly VELOCITY_SCALE_FACTOR = 0.12;

    // Required to later unbind listerners
    private mouseMove: (e: MouseEvent) => void;
    private mouseUp: (e: MouseEvent) => void;

    constructor(start: Vec2, end: Vec2, shoot: (vel: Vec2) => void, move: (pos: Vec2) => void) {
        this.start = start;
        this.end = end;
        this.shoot = shoot;
        this.move = move;

        this.mouseMove = this.handeMouseMove.bind(this);
        this.mouseUp = this.handleMouseUp.bind(this);
        document.getElementById('canvas1').addEventListener('mousemove', this.mouseMove);
        document.getElementById('canvas1').addEventListener('mouseup', this.mouseUp);
    }

    getVelocity(): Vec2 {
        return new Vec2(
            (this.start.x - this.end.x) * ShootingCue.VELOCITY_SCALE_FACTOR,
            (this.start.y - this.end.y) * ShootingCue.VELOCITY_SCALE_FACTOR
        );
    }

    length(): number {
        return Math.sqrt(Math.pow(this.start.x - this.end.x, 2) + Math.pow(this.start.y - this.end.y, 2));
    }

    private handeMouseMove(e: MouseEvent): void {
        let loc = getCanvasMouseLocation(e);

        this.end = loc;
        this.move(loc);

        e.stopPropagation();
    }

    private handleMouseUp(e: MouseEvent): void {
        e.stopPropagation();
        let vel = this.getVelocity();
        this.shoot(vel);

        document.getElementById('canvas1').removeEventListener('mousemove', this.mouseMove);
        document.getElementById('canvas1').removeEventListener('mouseup', this.mouseUp);
    }
}