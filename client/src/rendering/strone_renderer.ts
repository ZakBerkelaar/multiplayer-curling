import { Game } from "../../../common/game.js";
import { PlayerType } from "../../../common/player_type.js";
import { Stone } from "../../../common/stone.js";
import { Renderer } from "./renderer.js";

export class StoneRenderer implements Renderer {
    stone: Stone;

    private static readonly OUTER_SHADOW_OFFSET: number = 2;
    private static readonly INNER_SHADOW_OFFSET: number = 1;

    constructor(stone: Stone) {
        this.stone = stone;
    }

    render(context: CanvasRenderingContext2D, game: Game): void {
        // Draw outer stone circle
        const color = this.stone.team === PlayerType.Home ? "red" : "yellow";

        context.beginPath();
        context.arc(
            this.stone.position.x,
            this.stone.position.y,
            Stone.radius,
            0,
            2 * Math.PI
        );
        context.fillStyle = 'gray';
        context.strokeStyle = 'gray';
        context.fill();
        context.stroke();

        // Draw inner colored circle
        context.beginPath()
        context.arc(
            this.stone.position.x,
            this.stone.position.y,
            Stone.radius / 2,
            0,
            2 * Math.PI
        );
        context.fillStyle = color;
        context.strokeStyle = color;
        context.fill();
        context.stroke();

        // Closeup view

        // Outer shadow
        context.beginPath();
        context.arc(
            game.ice.closeupArea.bounds.location.x + (this.stone.position.x - game.ice.shootingArea.bounds.location.x) * game.ice.getZoomFactor() + StoneRenderer.OUTER_SHADOW_OFFSET,
            game.ice.closeupArea.bounds.location.y + (this.stone.position.y - game.ice.shootingArea.bounds.location.y) * game.ice.getZoomFactor() + StoneRenderer.OUTER_SHADOW_OFFSET,
            Stone.radius * game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'black';
        context.strokeStyle = 'black';
        context.fill();
        context.stroke();

        // Outer stored colored circle
        context.beginPath();
        context.arc(
            game.ice.closeupArea.bounds.location.x + (this.stone.position.x - game.ice.shootingArea.bounds.location.x)*game.ice.getZoomFactor(),
            game.ice.closeupArea.bounds.location.y + (this.stone.position.y - game.ice.shootingArea.bounds.location.y)*game.ice.getZoomFactor(),
            Stone.radius*game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'gray';
        context.strokeStyle = 'gray';
        context.fill();
        context.stroke();

        // Inner colored shaodw circle
        context.beginPath()
        context.arc(
            game.ice.closeupArea.bounds.location.x + (this.stone.position.x - game.ice.shootingArea.bounds.location.x)*game.ice.getZoomFactor() + StoneRenderer.INNER_SHADOW_OFFSET,
            game.ice.closeupArea.bounds.location.y + (this.stone.position.y - game.ice.shootingArea.bounds.location.y)*game.ice.getZoomFactor() + StoneRenderer.INNER_SHADOW_OFFSET,
            Stone.radius/2*game.ice.getZoomFactor(),
            0,
            2*Math.PI
        );
        context.fillStyle = 'black';
        context.strokeStyle = 'black';
        context.fill();
        context.stroke();

        // Inner colored circle
        context.beginPath()
        context.arc(
            game.ice.closeupArea.bounds.location.x + (this.stone.position.x - game.ice.shootingArea.bounds.location.x)*game.ice.getZoomFactor(),
            game.ice.closeupArea.bounds.location.y + (this.stone.position.y - game.ice.shootingArea.bounds.location.y)*game.ice.getZoomFactor(),
            Stone.radius/2*game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = color;
        context.strokeStyle = color;
        context.fill();
        context.stroke();
    }
}