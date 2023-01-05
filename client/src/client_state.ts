import { Game } from "../../common/game.js";
import { List } from "../../common/list.js";
import { PlayerType } from "../../common/player_type.js";
import { ClientNetworker } from "./networking/client_networker.js";
import { Renderer } from "./rendering/renderer.js";

export class ClientState {
    networker: ClientNetworker;
    renderers: List<Renderer>;
    myRole: PlayerType;
    redraw: () => void;
    game: Game;
    redrawTimer: NodeJS.Timer;
}