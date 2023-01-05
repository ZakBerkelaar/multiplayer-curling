import { Vec2 } from "../../vec2.js";
import { Packet } from "../packet.js";
import { PacketBuffer } from "../packet_buffer.js";

export class UpdateCueAimPacket implements Packet {
    action: CueAimPacketAction;
    position: Vec2;

    constructor(action: CueAimPacketAction = undefined, position: Vec2 = undefined) {
        this.action = action;
        this.position = position;
    }

    id(): string {
        return "UpdateCueAimPacket";
    }
    write(buffer: PacketBuffer): void {
        buffer.write("action", this.action);
        buffer.write("posx", this.position.x);
        buffer.write("posy", this.position.y);
    }
    read(buffer: PacketBuffer): void {
        this.action = buffer.read("action");
        const posx = buffer.read("posx");
        const posy = buffer.read("posy");
        this.position = new Vec2(posx, posy);
    }
    
}

export enum CueAimPacketAction {
    Start,
    Position,
    End
}