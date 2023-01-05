import { Server, Socket } from "socket.io";
import { Networker } from "../common/networking/networker.js";
import { Packet } from "../common/networking/packet.js";
import { PacketBuffer } from "../common/networking/packet_buffer.js";
import { Player } from "../common/player.js";

export class ServerNetworker extends Networker {
    private callbackMap: { [id: string]: (p: Packet, s: Socket) => void } = {};
    private packetMap: { [id: string]: new () => Packet } = {};

    io: Server

    onDisconnect: (socket: Socket) => void;

    constructor(io: Server, onDisconnect: (socket: Socket) => void) {
        super();
        this.io = io;
        this.onDisconnect = onDisconnect.bind(this);

        io.on('connection', this.onIoConnect.bind(this));
    }

    send(packet: Packet, except: Player = undefined): void {
        let buffer = new PacketBuffer();
        buffer.write(ServerNetworker.PACKET_ID_KEY, packet.id());
        packet.write(buffer);

        if (except === undefined)
            this.io.emit(ServerNetworker.PACKET_EVENT, buffer.json());
        else {
            this.io.fetchSockets().then(sockets => {
                for (const socket of sockets) {
                    if(socket.id !== except.id) {
                        socket.emit(ServerNetworker.PACKET_EVENT, buffer.json())
                    }
                }
            })
        }
    }

    sendToPlayer(player: Player, packet: Packet): void {
        let buffer = new PacketBuffer();
        buffer.write(ServerNetworker.PACKET_ID_KEY, packet.id());
        packet.write(buffer);

        this.io.to(player.id).emit(ServerNetworker.PACKET_EVENT, buffer.json());
    }

    registerPacket<T extends Packet>(p: new () => T, callback: (p: T, s: Socket) => void): void {
        let x: Packet = new p();
        this.callbackMap[x.id()] = callback;
        this.packetMap[x.id()] = p;
    }

    private onIoConnect(socket: Socket): void {
        socket.on(ServerNetworker.PACKET_EVENT, json => {
            // Decode packet
            let buffer = PacketBuffer.fromJSON(json);
            let packetId = buffer.read(ServerNetworker.PACKET_ID_KEY) as string;

            // Create packet from id
            let packet = new this.packetMap[packetId]();
            packet.read(buffer);
            // Call the callback
            this.callbackMap[packetId](packet, socket);
        });
        socket.on('disconnect', (reason => {
            this.onDisconnect(socket);
        }));
    }
}