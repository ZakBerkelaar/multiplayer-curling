import { PacketBuffer } from './packet_buffer.js'

export interface Packet {
    id(): string;

    write(buffer: PacketBuffer): void;
    read(buffer: PacketBuffer): void;
}
