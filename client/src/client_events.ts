import { RequestRolePacket } from "../../common/networking/packets/c2s/request_role_packet.js";
import { PlayerType } from "../../common/player_type.js";
import { Vec2 } from "../../common/vec2.js";
import { ClientNetworker } from "./networking/client_networker.js";
import { pointInRect } from "../../common/collision/collision_helpers.js";
import { ClientState } from "./client_state.js";
import { Stone } from "../../common/stone.js";
import { ShootingCue } from "./shooting_cue.js";
import { CueRenderer } from "./rendering/cue_renderer.js";
import { UpdatePositionPacket } from "../../common/networking/packets/update_position_packet.js";
import { ShootStonePacket } from "../../common/networking/packets/c2s/shoot_stone_packet.js";
import { CueAimPacketAction, UpdateCueAimPacket } from "../../common/networking/packets/update_cue_aim_packet.js";

function tryJoinHome(networker: ClientNetworker): () => void {
    return function () {
        networker.send(new RequestRolePacket(PlayerType.Home));
    }
}
function tryJoinVisitor(networker: ClientNetworker): () => void {
    return function () {
        networker.send(new RequestRolePacket(PlayerType.Visitor));
    }
}
function tryJoinSpectator(networker: ClientNetworker): () => void {
    return function () {
        networker.send(new RequestRolePacket(PlayerType.Spectator));
    }
}

export function getCanvasMouseLocation(e: MouseEvent): Vec2 {
    let rect = document.getElementById('canvas1').getBoundingClientRect();


    // Account for scroll offset
    const elem = document.getElementsByTagName('html')[0];
    let sox = elem.scrollLeft;
    let soy = elem.scrollTop;

    let canX = e.pageX - rect.left - sox;
    let canY = e.pageY - rect.top - soy;

    return new Vec2(canX, canY);
}

function handleMouseDown(state: ClientState): (e: MouseEvent) => void {
    return function(e: MouseEvent) {
        if(state.game === undefined)
            return; // We are not currently in game

        let loc = getCanvasMouseLocation(e);

        if(pointInRect(loc, state.game.ice.getShootingCrosshairArea().bounds)) {
            // We are trying to shoot
            if(state.myRole != state.game.turn) {
                alert("You can only shoot on your turn!");
                return;
            }

            // Choose the stone we're going to shoot
            let toShoot: Stone = undefined;
            if(state.myRole == PlayerType.Home) {
                // Get the first stone yet to be shot
                for(let i = 0; i < state.game.homeStones.length(); i++) {
                    if(state.game.homeStones.get(i).beenShot == false) {
                        toShoot = state.game.homeStones.get(i);
                        break;
                    }
                }
            }
            else {
                // Get the first stone yet to be shot
                for(let i = 0; i < state.game.visitorStoes.length(); i++) {
                    if(state.game.visitorStoes.get(i).beenShot == false) {
                        toShoot = state.game.visitorStoes.get(i);
                        break;
                    }
                }
            }
            if(toShoot === undefined)
                throw new Error("We ran out of stones to shoot, this should not have happened");
            
            // Send a packet to the server stateing that we are preparing to shoot (update stone location)
            state.networker.send(new UpdatePositionPacket(toShoot.id, new Vec2(loc.x, loc.y)));

            toShoot.position = new Vec2(loc.x, loc.y);
            toShoot.velocity = Vec2.zero();
            let renderer: CueRenderer = undefined;
            let cue: ShootingCue = new ShootingCue(toShoot.position, toShoot.position, v => {
                state.networker.send(new ShootStonePacket(toShoot.id, v));
                state.renderers.remove(renderer);
                toShoot.beenShot = true; // We just shot it
                state.networker.send(new UpdateCueAimPacket(CueAimPacketAction.End, Vec2.zero()));
            }, p => {
                state.networker.send(new UpdateCueAimPacket(CueAimPacketAction.Position, p));
            });
            state.networker.send(new UpdateCueAimPacket(CueAimPacketAction.Start, toShoot.position));
            renderer = new CueRenderer(cue);
            state.renderers.add(renderer);
        }

        e.stopPropagation();
        e.preventDefault();
    }
}

export function addEventListeners(networker: ClientNetworker): void {
    document.getElementById('JoinAsHomeButton').addEventListener('click', tryJoinHome(networker));
    document.getElementById('JoinAsVisitorButton').addEventListener('click', tryJoinVisitor(networker));
    document.getElementById('JoinAsSpectatorButton').addEventListener('click', tryJoinSpectator(networker));
}

export function addGameEventListerners(state: ClientState): void {
    document.getElementById('canvas1').addEventListener('mousedown', handleMouseDown(state))
}

export function roleTaken(role: PlayerType) {
    if (role === PlayerType.Home)
        (document.getElementById('JoinAsHomeButton') as HTMLButtonElement).disabled = true;
    if (role === PlayerType.Visitor)
        (document.getElementById('JoinAsVisitorButton') as HTMLButtonElement).disabled = true;
    if (role === PlayerType.Spectator)
        (document.getElementById('JoinAsSpectatorButton') as HTMLButtonElement).disabled = true;
}

export function resetRoleButtons() {
    (document.getElementById('JoinAsHomeButton') as HTMLButtonElement).disabled = false;
    (document.getElementById('JoinAsVisitorButton') as HTMLButtonElement).disabled = false;
    (document.getElementById('JoinAsSpectatorButton') as HTMLButtonElement).disabled = false;
}