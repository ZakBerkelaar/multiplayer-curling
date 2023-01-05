import { Vec2 } from "./vec2.js";
import { PlayerType } from "./player_type.js";
import { Subspace } from "./subspace.js";

export class Stone {
    id: number;

    position: Vec2;
    velocity: Vec2;
    bounds: Subspace;

    team: PlayerType;
    beenShot: boolean;

    static readonly radius: number = 5;
    static readonly FRICTION_FACTOR = 0.995;

    constructor(location: Vec2, team: PlayerType, bounds: Subspace, id: number) {
        this.id = id;

        this.position = location;
        this.velocity = Vec2.zero();
        this.bounds = bounds;
        this.beenShot = false;
        if (team === PlayerType.Home || team === PlayerType.Visitor)
            this.team = team;
        else
            throw new Error("Bad team provdied to stone");
    }

    stop(): void {
        this.velocity = Vec2.zero();
    }

    update(): void {
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.mul(Stone.FRICTION_FACTOR);

        if (this.position.x + Stone.radius > this.bounds.bounds.location.x + this.bounds.bounds.size.x) { this.position.x = this.bounds.bounds.location.x + this.bounds.bounds.size.x - Stone.radius; this.stop(); }
        if (this.position.x - Stone.radius < this.bounds.bounds.location.x) { this.position.x = this.bounds.bounds.location.x + Stone.radius; this.stop(); }
        if (this.position.y + Stone.radius > this.bounds.bounds.size.y) { this.position.y = this.bounds.bounds.size.y - Stone.radius; this.stop(); }
        if (this.position.y - Stone.radius < this.bounds.bounds.location.y) { this.position.y = this.bounds.bounds.location.y + Stone.radius; this.stop(); }

        const TOLERANCE = 0.06;
        if(this.velocity.sqrMagnitude() < TOLERANCE) 
        {
            this.stop();
        }
    }
}