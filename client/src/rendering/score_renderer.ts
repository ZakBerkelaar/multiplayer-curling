import { Game } from "../../../common/game.js";
import { Renderer } from "./renderer.js";

export class ScoreRenderer implements Renderer {
    render(context: CanvasRenderingContext2D, game: Game): void {
        const closeUpArea = game.ice.closeupArea;
        //draw score for home and visitor team.
        const HOME_SCORE_LEFT_MARGIN = 100
        const VISITOR_SCORE_RIGHT_MARGIN = 160
        const SCORE_TOP_MARGIN = 100
        const PROMPT_RECTANGLE_TOP_MARGIN = 20
        const PROMPT_RECTANGLE_WIDTH = 60
        const PROMPT_RECTANGLE_HEIGHT = 100

        const score = game.getScores();

        context.font = '80pt Courier New'
        context.strokeStyle = 'black'
        context.fillStyle = 'red'
        context.fillText(`${score.home}`, closeUpArea.bounds.location.x + HOME_SCORE_LEFT_MARGIN, closeUpArea.bounds.location.y + SCORE_TOP_MARGIN)
        context.strokeText(`${score.home}`, closeUpArea.bounds.location.x + HOME_SCORE_LEFT_MARGIN, closeUpArea.bounds.location.y + SCORE_TOP_MARGIN)
        context.strokeStyle = 'black'
        context.fillStyle = 'yellow'
        context.fillText(`${score.visitor}`, closeUpArea.bounds.location.x + closeUpArea.bounds.size.x - VISITOR_SCORE_RIGHT_MARGIN, closeUpArea.bounds.location.y + SCORE_TOP_MARGIN)
        context.strokeText(`${score.visitor}`, closeUpArea.bounds.location.x + closeUpArea.bounds.size.x - VISITOR_SCORE_RIGHT_MARGIN, closeUpArea.bounds.location.y + SCORE_TOP_MARGIN)
    }
}