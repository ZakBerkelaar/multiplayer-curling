import { Socket } from "socket.io-client";
import { Networker } from "../../../common/networking/networker.js";
import { Packet } from "../../../common/networking/packet.js";
import { PacketBuffer } from "../../../common/networking/packet_buffer.js";

export class ClientNetworker extends Networker {
    private callbackMap: { [id: string]: (p: Packet) => void } = {};
    private packetMap: { [id: string]: new() => Packet } = {}

        socket: Socket;

    constructor(socket: Socket) {
        super();
        this.socket = socket;

        this.socket.on('connect', this.onSocketConnect.bind(this));
        this.socket.on('disconnect', this.onSocketDisconnect.bind(this));
    }

    send(packet: Packet): void {
        let buffer = new PacketBuffer();
        buffer.write(ClientNetworker.PACKET_ID_KEY, packet.id());
        packet.write(buffer);

        // Send the message
        this.socket.emit(ClientNetworker.PACKET_EVENT, buffer.json());
    }

    registerPacket<T extends Packet>(p: new () => T, callback: (p: T) => void): void {
        let x: Packet = new p();
        this.callbackMap[x.id()] = callback;
        this.packetMap[x.id()] = p;
    }

    private onSocketConnect(): void {
        this.socket.on(ClientNetworker.PACKET_EVENT, json => {
            // Decode the buffer
            let buffer = PacketBuffer.fromJSON(json);
            let packetId = buffer.read(ClientNetworker.PACKET_ID_KEY) as string;

            // Create a packet with the read ID
            let packet = new this.packetMap[packetId]();
            packet.read(buffer);
            // Call the callback
            this.callbackMap[packetId](packet);
        })
    }

    private onSocketDisconnect(): void {
        throw new Error("Socket disconnected unexpectedly.");
    }
}