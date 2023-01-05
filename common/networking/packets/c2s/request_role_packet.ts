import { PlayerType } from "../../../player_type.js";
import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class RequestRolePacket implements Packet {
    role: PlayerType;

    constructor(role: PlayerType = PlayerType.None)
    {
        this.role = role;
    }

    id(): string {
        return "RequestRolePacket";
    }

    write(buffer: PacketBuffer): void {
        buffer.write('role', this.role);
    }

    read(buffer: PacketBuffer): void {
        this.role = buffer.read('role');
    }
}