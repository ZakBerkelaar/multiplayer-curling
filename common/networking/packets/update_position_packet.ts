import { Vec2 } from "../../vec2.js";
import { Packet } from "../packet.js";
import { PacketBuffer } from "../packet_buffer.js";

export class UpdatePositionPacket implements Packet {

    stoneId: number;
    position: Vec2;

    constructor(stoneId: number = undefined, position: Vec2 = undefined) {
        this.stoneId = stoneId;
        this.position = position;
    }

    id(): string {
        return "UpdatePositionPacket";
    }
    write(buffer: PacketBuffer): void {
        buffer.write("id", this.stoneId);
        buffer.write("x", this.position.x);
        buffer.write("y", this.position.y);
    }
    read(buffer: PacketBuffer): void {
        this.stoneId = buffer.read("id");
        const x: number = buffer.read("x");
        const y: number = buffer.read("y");
        this.position = new Vec2(x, y);
    }
    
}