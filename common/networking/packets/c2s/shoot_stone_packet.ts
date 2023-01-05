import { Vec2 } from "../../../vec2.js";
import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class ShootStonePacket implements Packet {
    stoneId: number;
    velocity: Vec2;

    constructor(stoneId: number = undefined, velocity: Vec2 = undefined) {
        this.stoneId = stoneId;
        this.velocity = velocity;
    }

    id(): string {
        return "ShootStonePacket";
    }
    write(buffer: PacketBuffer): void {
        buffer.write("id", this.stoneId);
        buffer.write("velx", this.velocity.x);
        buffer.write("vely", this.velocity.y);
    }
    read(buffer: PacketBuffer): void {
        this.stoneId = buffer.read("id");
        const velx: number = buffer.read("velx");
        const vely: number = buffer.read("vely");
        this.velocity = new Vec2(velx, vely);
    }
    
}