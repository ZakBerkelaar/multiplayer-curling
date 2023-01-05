import { PlayerType } from "./player_type.js";

export class Player {
    id: string;
    type: PlayerType

    constructor(id: string, type: PlayerType) {
        this.id = id;
        this.type = type;
    }
}