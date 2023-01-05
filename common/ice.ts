import { Game } from "./game.js";
import { Rectangle } from "./rect.js";
import { Stone } from "./stone.js";
import { Subspace } from "./subspace.js";
import { Vec2 } from "./vec2.js";

const CLOSEUP_AREA_FRACTION = 75 / 100; //fraction of canvas width taken up by shooting area

export class Ice extends Subspace {
    shootingArea: Subspace;
    closeupArea: Subspace;

    constructor(size: Vec2) {
        super(new Rectangle(
            Vec2.zero(),
            size
        ));

        // Init subspaces
        this.closeupArea = new Subspace(new Rectangle(
            this.bounds.location,
            new Vec2(
                this.bounds.size.x * CLOSEUP_AREA_FRACTION,
                this.bounds.size.y
            )
        ));
        this.shootingArea = new Subspace(new Rectangle(
            new Vec2(
                this.bounds.location.x + this.closeupArea.bounds.size.x,
                this.bounds.location.y
            ),
            new Vec2(
                this.bounds.size.x * (1 - CLOSEUP_AREA_FRACTION),
                this.bounds.size.y
            )
        ));
    }

    getShootingCrosshairArea(): Subspace {
        const CROSSHAIR_BOTTOM_MARGIN = 140
        const CROSSHAIR_LEFT_MARGIN = 20
        const CROSSHAIR_AREA_HEIGHT = 60
        const CROSSHAIR_LINE_LENGTH = 10

        let rect = new Rectangle(
            new Vec2(
                this.shootingArea.bounds.location.x + CROSSHAIR_LEFT_MARGIN,
                this.shootingArea.bounds.location.y + this.shootingArea.bounds.size.y - CROSSHAIR_BOTTOM_MARGIN - CROSSHAIR_AREA_HEIGHT
            ),
            new Vec2(
                this.shootingArea.bounds.size.x - CROSSHAIR_LEFT_MARGIN*2,
                CROSSHAIR_AREA_HEIGHT
            )
        );

        return new Subspace(rect);
    }

    getZoomFactor(): number {
        return this.closeupArea.bounds.size.x/this.shootingArea.bounds.size.x;
    }

    getRingThickness(): number {
        return this.shootingArea.bounds.size.x/10;
    }
    getRingCenter(): Vec2 {
        return new Vec2(
            this.shootingArea.bounds.location.x + this.shootingArea.bounds.size.x/2,
            this.getRingThickness()*6
        );
    }

    getNominalStoneRadius(): number {
        return this.getRingThickness()/2;
    }

    organizeStones(game: Game): void {
        for(let i = 0; i < game.homeStones.length(); i++) {
            game.homeStones.get(i).position = new Vec2(this.shootingArea.bounds.location.x + Stone.radius, this.shootingArea.bounds.size.y - (Stone.radius + (game.homeStones.length()-i-1)*Stone.radius*2));
            game.visitorStoes.get(i).position = new Vec2(this.shootingArea.bounds.location.x + this.shootingArea.bounds.size.x - Stone.radius, this.shootingArea.bounds.size.y - (Stone.radius + (game.homeStones.length()-i-1)*Stone.radius*2));
        }
    }    
}