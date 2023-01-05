import { PlayerType } from "../../../player_type.js";
import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class EndGamePacket implements Packet {
    winner: PlayerType;

    // This class has a few special values
    // PlayType.None means someone disconnected
    // PlayType.Spectator means it was a tie. everyone wins if it's a tie ;)
    // Otherwise it is the specified player
    constructor(winner: PlayerType = PlayerType.None) {
        this.winner = winner;
    }

    id(): string {
        return "EndGamePacket";
    }
    write(buffer: PacketBuffer): void {
        buffer.write("winner", this.winner);
    }
    read(buffer: PacketBuffer): void {
        this.winner = buffer.read("winner");
    }
    
}