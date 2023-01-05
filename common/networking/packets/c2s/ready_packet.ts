import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class ReadyPacket implements Packet {

    constructor() {
        
    }

    id(): string {
        return "ReadyPacket";
    }
    write(buffer: PacketBuffer): void {
        
    }
    read(buffer: PacketBuffer): void {
    
    }
}