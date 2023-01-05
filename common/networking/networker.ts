import { Packet } from './packet.js';

export abstract class Networker {
    protected static PACKET_ID_KEY: string = "__PACKET_ID__";
    protected static PACKET_EVENT: string = "GamePacket";

    abstract send(packet: Packet): void;
}
