import { Vec2 } from "../../../vec2.js";
import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class StartGamePacket implements Packet {

    homeStones: number[];
    visitorStones: number[];
    size: Vec2;

    constructor(homeStones: number[] = undefined, visitorStones: number[] = undefined, size: Vec2 = undefined) {
        this.homeStones = homeStones;
        this.visitorStones = visitorStones;
        this.size = size;
    }

    id(): string {
        return "StartGamePacket";
    }
    write(buffer: PacketBuffer): void {
        buffer.write("home", this.homeStones);
        buffer.write("visitor", this.visitorStones);
        buffer.write("size", this.size);
    }
    read(buffer: PacketBuffer): void {
        this.homeStones = buffer.read("home");
        this.visitorStones = buffer.read("visitor");
        this.size = buffer.read("size");
    }
}