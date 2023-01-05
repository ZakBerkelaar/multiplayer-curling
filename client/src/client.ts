import { Socket } from "socket.io-client";
import { Game } from "../../common/game.js";
import { List } from "../../common/list.js";
import { ReadyPacket } from "../../common/networking/packets/c2s/ready_packet.js";
import { HelloPacket } from "../../common/networking/packets/hello_packet.js";
import { ChangeTurnPacket } from "../../common/networking/packets/s2c/change_turn_packet.js";
import { EndGamePacket } from "../../common/networking/packets/s2c/end_game_packet.js";
import { ProvideRolePacket } from "../../common/networking/packets/s2c/provide_role_packet.js";
import { RoleTakenPacket } from "../../common/networking/packets/s2c/role_taken_packet.js";
import { StartGamePacket } from "../../common/networking/packets/s2c/start_game_packet.js";
import { StartInfoPacket } from "../../common/networking/packets/s2c/start_info_packet.js";
import { CueAimPacketAction, UpdateCueAimPacket } from "../../common/networking/packets/update_cue_aim_packet.js";
import { UpdatePositionPacket } from "../../common/networking/packets/update_position_packet.js";
import { PlayerType } from "../../common/player_type.js";
import { Rectangle } from "../../common/rect.js";
import { Subspace } from "../../common/subspace.js";
import { Vec2 } from "../../common/vec2.js";
import { addEventListeners, addGameEventListerners, resetRoleButtons, roleTaken } from "./client_events.js";
import { ClientState } from "./client_state.js";
import { ClientNetworker } from "./networking/client_networker.js";
import { CueRenderer } from "./rendering/cue_renderer.js";
import { IceRenderer } from "./rendering/ice_renderer.js";
import { Renderer } from "./rendering/renderer.js";
import { ScoreRenderer } from "./rendering/score_renderer.js";
import { StoneRenderer } from "./rendering/strone_renderer.js";
import { ShootingCue } from "./shooting_cue.js";

declare function io(): any; // Needed to make it compile for some reason

document.addEventListener('DOMContentLoaded', () => {
    const socket: Socket = io();
    // const networker = new ClientNetworker(socket);
    // const renderers: List<Renderer> = new List<Renderer>();
    // let myRole = PlayerType.None;
    // let redraw: () => void = function(){};
    // let game: Game = undefined;
    // let redrawTimer: NodeJS.Timer = undefined;
    let state = new ClientState();
    state.networker = new ClientNetworker(socket);
    state.renderers = new List<Renderer>();
    state.myRole = PlayerType.None;
    state.redraw = function(){};
    state.game = undefined;
    state.redrawTimer = undefined;

    let canvas = (document.getElementById("canvas1") as HTMLCanvasElement);
    let context = canvas.getContext("2d");

    // Used to draw the default area when the page first loads
    new IceRenderer().render(context, new Game(new Subspace(new Rectangle(
        Vec2.zero(),
        new Vec2(canvas.width, canvas.height)
    ))));

    state.networker.registerPacket(HelloPacket, p => {
        throw new Error("This was unexpected");
    });
    state.networker.registerPacket(ProvideRolePacket, p => {
        if (p.role === PlayerType.None)
            throw new Error("This role that was selected is no longer available"); // The server will send back PlayerType.none if there was an error providing you with that role
        state.myRole = p.role;
        // This will disable all the buttons
        roleTaken(PlayerType.Home);
        roleTaken(PlayerType.Visitor);
        roleTaken(PlayerType.Spectator);
        alert(`You are now ${PlayerType[p.role]}`);
    });
    state.networker.registerPacket(StartInfoPacket, p => {
        if (p.homeTaken)
            roleTaken(PlayerType.Home);
        if (p.visitorTaken)
            roleTaken(PlayerType.Visitor);
    });
    state.networker.registerPacket(RoleTakenPacket, p => {
        if (p.role === PlayerType.Home)
            roleTaken(PlayerType.Home);
        else if (p.role === PlayerType.Visitor)
            roleTaken(PlayerType.Visitor);
    });
    state.networker.registerPacket(StartGamePacket, p => {
        // Stop previous timers
        clearInterval(state.redrawTimer);
        state.game = undefined;
        state.redraw = function(){};
        state.renderers.data = []; // Reset the renderers

        if(canvas.width !== p.size.x || canvas.height !== p.size.y)
            throw new Error("Client game area does not match server game area.");

        state.game = new Game(new Subspace(new Rectangle(
            Vec2.zero(),
            new Vec2(canvas.width, canvas.height)
        )));

        state.game.createStones(p.homeStones, p.visitorStones);
        // state.game.ice.organizeStones(state.game);

        state.renderers.add(new IceRenderer());
        state.game.stones.data.forEach(stone => {
            state.renderers.add(new StoneRenderer(stone));
        });
        state.renderers.add(new ScoreRenderer());

        // Draw
        state.redraw = function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            state.renderers.data.forEach(renderer => {
                renderer.render(context, state.game);
            });
        };
        state.redraw();

        state.redrawTimer = setInterval(function() {
            state.redraw();
            state.game.stones.data.forEach(stone => {
                stone.update();
            });
        }, 1000/30); // Target around 30 fps (should be easy)
        
    });
    state.networker.registerPacket(ChangeTurnPacket, p => {
        state.game.turn = p.turn;
    });
    state.networker.registerPacket(UpdatePositionPacket, p => {
        state.game.getStoneById(p.stoneId).position = p.position;
    });
    state.networker.registerPacket(EndGamePacket, p => {
        clearInterval(state.redrawTimer);
        state.game = undefined;
        state.redraw = function(){};
        state.renderers.data = [];
        state.myRole = PlayerType.None;

        if(p.winner === PlayerType.None) {
            alert("A player has disconnected. Resetting!");
        }
        else if(p.winner === PlayerType.Home) {
            alert("Home has won!");
        }
        else if(p.winner === PlayerType.Visitor) {
            alert("Visitor has won!");
        }
        else {
            // It was a tie
            alert("Tie!");
        }

        resetRoleButtons();
        state.networker.send(new ReadyPacket());
    })

    // Spectator cue rendering
    let spectatorCueRenderer: CueRenderer = undefined, spectatorCue: ShootingCue = undefined;
    state.networker.registerPacket(UpdateCueAimPacket, p => {
        switch (p.action) {
            case CueAimPacketAction.Start:
                if(spectatorCueRenderer !== undefined || spectatorCue !== undefined) 
                    throw new Error("Attempting to render two different spectator cues.");

                spectatorCue = new ShootingCue(p.position, p.position, _ => {}, _ => {});
                spectatorCueRenderer = new CueRenderer(spectatorCue);
                state.renderers.add(spectatorCueRenderer);
                break;
        
            case CueAimPacketAction.Position:
                if(spectatorCueRenderer === undefined || spectatorCue === undefined)
                    throw new Error("Attempting to update the position of a non-existant cue");

                spectatorCue.end = p.position;
                break;

            case CueAimPacketAction.End:
                if(spectatorCueRenderer === undefined || spectatorCue === undefined)
                    throw new Error("Attempted to delete non-existant spectator cue");

                state.renderers.remove(spectatorCueRenderer);
                spectatorCueRenderer = undefined;
                spectatorCue = undefined;
                break;

            default:
                throw new Error();
        }
    });

    addEventListeners(state.networker);
    addGameEventListerners(state);

    state.networker.send(new ReadyPacket());
    state.networker.send(new HelloPacket("Howdy server"));
})