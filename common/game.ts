import { Player } from "./player.js";
import { Stone } from "./stone.js";
import { List } from "./list.js";
import { Vec2 } from "./vec2.js";
import { PlayerType } from "./player_type.js";
import { Subspace } from "./subspace.js";
import { Ice } from "./ice.js";

export class Game {
    players: Player[]

    stones: List<Stone>;
    visitorStoes: List<Stone>;
    homeStones: List<Stone>;

    space: Subspace;
    ice: Ice;

    turn: PlayerType;

    constructor(space: Subspace) {
        this.space = space;
        this.ice = new Ice(space.bounds.size);

        this.players = [];
        this.stones = new List<Stone>();
        this.visitorStoes = new List<Stone>();
        this.homeStones = new List<Stone>();

        this.turn = PlayerType.None;
    }

    createStones(home_stones: number[], visitor_stones: number[]): void {
        // home_stones and visitor_stones are ids
        for (let i = 0; i < home_stones.length; i++) {
            let hStone = new Stone(Vec2.zero(), PlayerType.Home, this.ice.shootingArea, home_stones[i]);
            this.homeStones.add(hStone);
            this.stones.add(hStone);
        }
        for (let i = 0; i < visitor_stones.length; i++) {
            let vStone = new Stone(Vec2.zero(), PlayerType.Visitor, this.ice.shootingArea, visitor_stones[i]);
            this.visitorStoes.add(vStone);
            this.stones.add(vStone);
        }
    }

    getStoneById(id: number): Stone {
        for (let i = 0; i < this.stones.length(); i++) {
            if (this.stones.get(i).id === id)
                return this.stones.get(i);
        }
        return null;
    }

    resolveCollisions(): void {
        // Find all stones that could be colliding
        // It's slow but there's only 10 stones

        let collided: boolean[][] = [];
        for (let i = 0; i < this.stones.length(); i++) {
            collided.push([]);
            for (let j = 0; j < this.stones.length(); j++) {
                collided[i].push(false);
            }
        }

        for (let i = 0; i < this.stones.length(); i++) {
            for (let j = 0; j < this.stones.length(); j++) {
                if (i !== j) {
                    let stonei = this.stones.get(i);
                    let stonej = this.stones.get(j);

                    let differenceVec = stonei.position.sub(stonej.position);
                    if (differenceVec.magnitude() < Stone.radius * 2) {
                        // Collision

                        // Find the moving stone moving the fastest (we'll take it to be the colliding stone)
                        let sim = stonei.velocity.sqrMagnitude();
                        let sjm = stonej.velocity.sqrMagnitude();
                        let moving: Stone, other: Stone;
                        if (sim > sjm) {
                            moving = stonei;
                            other = stonej;
                        }
                        else {
                            moving = stonej;
                            other = stonei;
                        }

                        // Let's first stop by moving them away from eachother
                        let movingOtherDst = other.position.sub(moving.position);
                        let overlap = (2 * Stone.radius) - movingOtherDst.magnitude();
                        let tmp = movingOtherDst.mul(1 / movingOtherDst.magnitude()).mul(overlap*2);
                        other.position = other.position.add(tmp);

                        let angle = Math.atan2(movingOtherDst.y, movingOtherDst.x);

                        let speed = moving.velocity.sqrMagnitude();

                        // Give some of this speed to the other stone
                        const TRANSFER_COEFFICIENT = 0.95;
                        let otherX = (speed * TRANSFER_COEFFICIENT) * Math.cos(angle);
                        let otherY = (speed * TRANSFER_COEFFICIENT) * Math.sin(angle);
                        let otherVec = new Vec2(otherX, otherY);

                        other.velocity = otherVec;

                        // Take some of this speed away from the moving stone
                        moving.velocity = moving.velocity.mul(1 - TRANSFER_COEFFICIENT);
                    }
                }
            }
        }
    }

    getScores(): Scores {
        const outerDistance = this.ice.getRingThickness() * 5;
        const center = this.ice.getRingCenter();

        let stonePos: StonePositions[] = [];
        this.stones.data.forEach(stone => {
            stonePos.push(new StonePositions(stone.team, stone.position));
        });
        stonePos.sort((a, b) => {
            if(a.position.sub(center).sqrMagnitude() < b.position.sub(center).sqrMagnitude()) return -1;
            if(a.position.sub(center).sqrMagnitude() === b.position.sub(center).sqrMagnitude()) return 0;
            if(a.position.sub(center).sqrMagnitude() > b.position.sub(center).sqrMagnitude()) return 1;

            throw new Error(); // This will never happen it just stops warnings
        });

        let closest = stonePos[0];
        let closestTeam = closest.team;

        if(closest.position.sub(center).magnitude() > outerDistance) return new Scores(0, 0);
        let lyingStonesCount = 0;
        for(let i = 0; i < stonePos.length; i++) {
            if(stonePos[i].team === closestTeam) 
                lyingStonesCount++;
            else
                break;
        }
        if(closestTeam === PlayerType.Home)
            return new Scores(0, lyingStonesCount);
        else if(closestTeam === PlayerType.Visitor)
            return new Scores(lyingStonesCount, 0);
        else
            return new Scores(0, 0);
    }
}

class StonePositions {
    team: PlayerType;
    position: Vec2;

    constructor(team: PlayerType, pos: Vec2) {
        this.team = team;
        this.position = pos;
    }
}

export class Scores {
    visitor: number;
    home: number;

    constructor(visitor: number, home: number) {
        this.visitor = visitor;
        this.home = home;
    }
}