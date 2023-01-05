import { PlayerType } from "../../../player_type.js";
import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class ChangeTurnPacket implements Packet {

    turn: PlayerType;

    constructor(turn: PlayerType = PlayerType.None) {
        this.turn = turn;
    }

    id(): string {
        return "ChangeTurnPacket";
    }
    write(buffer: PacketBuffer): void {
        buffer.write("turn", this.turn);
    }
    read(buffer: PacketBuffer): void {
        this.turn = buffer.read("turn");
    }

}