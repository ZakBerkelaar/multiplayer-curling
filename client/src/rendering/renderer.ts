import { Game } from "../../../common/game.js";

export let HOME_PROMPOT_COLOR = '#ffcccc';
export let VISITOR_PROMPOT_COLOR = '#ffffcc';
export let SPECTATOR_PROMPOT_COLOR = '#ccffcc';

export interface Renderer
{
    render(context: CanvasRenderingContext2D, game: Game): void;
}