import { Game } from "../../../common/game.js";
import { PlayerType } from "../../../common/player_type.js";
import { HOME_PROMPOT_COLOR, Renderer, VISITOR_PROMPOT_COLOR } from "./renderer.js";

export class IceRenderer implements Renderer {
    render(context: CanvasRenderingContext2D, game: Game): void {
        // Draw dividing line
        context.fillStyle = 'blue';
        context.strokeStyle = 'blue';

        context.beginPath();
        context.moveTo(game.ice.closeupArea.bounds.size.x, 0);
        context.moveTo(game.ice.closeupArea.bounds.size.x, game.ice.bounds.size.y);
        context.stroke();

        // Draw croshair shooting area
        let cx = game.ice.getShootingCrosshairArea();

        if (game.turn == PlayerType.Home)
            context.fillStyle = HOME_PROMPOT_COLOR;
        else if(game.turn == PlayerType.Visitor)
            context.fillStyle = VISITOR_PROMPOT_COLOR;
        else
            context.fillStyle = 'gray'

        context.strokeStyle = 'lightgray';
        context.fillRect(cx.bounds.location.x, cx.bounds.location.y, cx.bounds.size.x, cx.bounds.size.y);

        // Shooting crosshair
        const CROSSHAIR_LINE_LENGTH = 20;
        context.strokeStyle = 'gray';
        context.beginPath();
        context.moveTo(cx.bounds.location.x + cx.bounds.size.x / 2 - CROSSHAIR_LINE_LENGTH / 2, cx.bounds.location.y + cx.bounds.size.y / 2);
        context.moveTo(cx.bounds.location.x + cx.bounds.size.x / 2 + CROSSHAIR_LINE_LENGTH / 2, cx.bounds.location.y + cx.bounds.size.y / 2);
        context.stroke();
        context.beginPath();
        context.moveTo(cx.bounds.location.x + cx.bounds.size.x / 2, cx.bounds.location.y + cx.bounds.size.y / 2 - CROSSHAIR_LINE_LENGTH);
        context.moveTo(cx.bounds.location.x + cx.bounds.size.x / 2, cx.bounds.location.y + cx.bounds.size.y / 2 + CROSSHAIR_LINE_LENGTH);
        context.stroke();

        // Draw blue ring
        context.beginPath();
        context.arc(
            game.ice.getRingCenter().x,
            game.ice.getRingCenter().y,
            game.ice.getRingThickness() * 4,
            0,
            2 * Math.PI
        );
        context.fillStyle = 'blue';
        context.strokeStyle = 'blue';
        context.fill();
        context.stroke();

        // Draw closeup of blue ring
        context.beginPath();
        context.arc(
            game.ice.closeupArea.bounds.location.x + (game.ice.getRingCenter().x - game.ice.shootingArea.bounds.location.x) * game.ice.getZoomFactor(),
            game.ice.closeupArea.bounds.location.y + (game.ice.getRingCenter().y - game.ice.shootingArea.bounds.location.y) * game.ice.getZoomFactor(),
            game.ice.getRingThickness() * 4 * game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'blue';
        context.strokeStyle = 'blue';
        context.fill();
        context.stroke();

        // Draw white ring
        context.beginPath();
        context.arc(
            game.ice.getRingCenter().x,
            game.ice.getRingCenter().y,
            game.ice.getRingThickness() * 3,
            0,
            2 * Math.PI
        );
        context.fillStyle = 'white';
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();

        // Draw closeup white ring
        context.beginPath();
        context.arc(
            game.ice.closeupArea.bounds.location.x + (game.ice.getRingCenter().x - game.ice.shootingArea.bounds.location.x) * game.ice.getZoomFactor(),
            game.ice.closeupArea.bounds.location.y + (game.ice.getRingCenter().y - game.ice.shootingArea.bounds.location.y) * game.ice.getZoomFactor(),
            game.ice.getRingThickness() * 3 * game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'white';
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();

        // Draw red ring
        context.beginPath();
        context.arc(
            game.ice.getRingCenter().x,
            game.ice.getRingCenter().y,
            game.ice.getRingThickness() * 2,
            0,
            2 * Math.PI
        );
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
        context.fill();
        context.stroke();

        // Draw red ring closeup
        context.beginPath();
        context.arc(
            game.ice.closeupArea.bounds.location.x + (game.ice.getRingCenter().x - game.ice.shootingArea.bounds.location.x) * game.ice.getZoomFactor(),
            game.ice.closeupArea.bounds.location.y + (game.ice.getRingCenter().y - game.ice.shootingArea.bounds.location.y) * game.ice.getZoomFactor(),
            game.ice.getRingThickness() * 2 * game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'red';
        context.strokeStyle = 'red';
        context.fill();
        context.stroke();

        // Draw white center
        context.beginPath();
        context.arc(
            game.ice.getRingCenter().x,
            game.ice.getRingCenter().y,
            game.ice.getRingThickness(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'white';
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();

        // Draw white center closeup
        context.beginPath();
        context.arc(
            game.ice.closeupArea.bounds.location.x + (game.ice.getRingCenter().x - game.ice.shootingArea.bounds.location.x) * game.ice.getZoomFactor(),
            game.ice.closeupArea.bounds.location.y + (game.ice.getRingCenter().y - game.ice.shootingArea.bounds.location.y) * game.ice.getZoomFactor(),
            game.ice.getRingThickness()*game.ice.getZoomFactor(),
            0,
            2 * Math.PI
        );
        context.fillStyle = 'white';
        context.strokeStyle = 'white';
        context.fill();
        context.stroke();

        // Draw cirlces crosshair
        context.strokeStyle = 'gray';
        context.beginPath();
        context.moveTo(game.ice.getRingCenter().x - game.ice.getRingThickness()*4.6, game.ice.getRingCenter().y)
        context.lineTo(game.ice.getRingCenter().x + game.ice.getRingThickness()*4.6, game.ice.getRingCenter().y)
        context.stroke();
        context.beginPath();
        context.moveTo(game.ice.getRingCenter().x, game.ice.getRingCenter().y - game.ice.getRingThickness()*4.6);
        context.lineTo(game.ice.getRingCenter().x, game.ice.getRingCenter().y + game.ice.getRingThickness()*4.6);
        context.stroke();

        // Draw closeup view circles crosshair
        const chx = game.ice.closeupArea.bounds.location.x + (game.ice.getRingCenter().x - game.ice.shootingArea.bounds.location.x)*game.ice.getZoomFactor();
        const chy = game.ice.closeupArea.bounds.location.y + (game.ice.getRingCenter().y - game.ice.shootingArea.bounds.location.y)*game.ice.getZoomFactor();
        context.strokeStyle = 'gray';
        context.beginPath();
        context.moveTo(chx - game.ice.getRingThickness()*4.8*game.ice.getZoomFactor(), chy);
        context.lineTo(chx + game.ice.getRingThickness()*4.8*game.ice.getZoomFactor(), chy);
        context.stroke();
        context.beginPath();
        context.moveTo(chx, chy - game.ice.getRingThickness()*4.6*game.ice.getZoomFactor());
        context.lineTo(chx, chy + game.ice.getRingThickness()*4.6*game.ice.getZoomFactor());
        context.stroke();
    }
}