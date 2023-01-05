import { Packet } from "../../packet.js";
import { PacketBuffer } from "../../packet_buffer.js";

export class StartInfoPacket implements Packet
{
    homeTaken: boolean;
    visitorTaken: boolean;

    constructor(homeTaken: boolean = false, visitorTaken: boolean = false)
    {
        this.homeTaken = homeTaken;
        this.visitorTaken = visitorTaken;
    }

    id(): string {
        return "StartInfoPacket"
    }

    write(buffer: PacketBuffer): void {
        buffer.write('homeTaken', this.homeTaken);
        buffer.write('visitorTaken', this.visitorTaken);
    }

    read(buffer: PacketBuffer): void {
        this.homeTaken = buffer.read('homeTaken');
        this.visitorTaken = buffer.read('visitorTaken');
    }
}