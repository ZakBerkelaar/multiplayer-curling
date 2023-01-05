import { Packet } from "../packet.js";
import { PacketBuffer } from "../packet_buffer.js";

export class HelloPacket implements Packet
{
    message: string;

    constructor(msg: string = "")
    {
        this.message = msg;
    }

    id(): string {
        return "HelloPacket";
    }

    write(buffer: PacketBuffer): void {
        buffer.write('msg', this.message);
    }
    read(buffer: PacketBuffer): void {
        this.message = buffer.read('msg');
    }
    
}