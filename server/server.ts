import http = require('http');
import fs = require('fs');
import url = require('url');

// @ts-ignore
import { Server, Socket } from "socket.io";
import { ServerNetworker } from './server_networker.js';
import { HelloPacket } from '../common/networking/packets/hello_packet.js';
import { Player } from '../common/player.js'
import { ReadyPacket } from '../common/networking/packets/c2s/ready_packet.js';
import { PlayerType } from '../common/player_type.js';
import { RequestRolePacket } from '../common/networking/packets/c2s/request_role_packet.js';
import { ProvideRolePacket } from '../common/networking/packets/s2c/provide_role_packet.js';
import { RoleTakenPacket } from '../common/networking/packets/s2c/role_taken_packet.js';
import { StartInfoPacket } from '../common/networking/packets/s2c/start_info_packet.js';
import { StartGamePacket } from '../common/networking/packets/s2c/start_game_packet.js';
import { ChangeTurnPacket } from '../common/networking/packets/s2c/change_turn_packet.js';
import { Game } from '../common/game.js';
import { Subspace } from '../common/subspace.js';
import { Rectangle } from '../common/rect.js';
import { Vec2 } from '../common/vec2.js';
import { UpdatePositionPacket } from '../common/networking/packets/update_position_packet.js';
import { ShootStonePacket } from '../common/networking/packets/c2s/shoot_stone_packet.js';
import { UpdateCueAimPacket } from '../common/networking/packets/update_cue_aim_packet.js';
import { EndGamePacket } from '../common/networking/packets/s2c/end_game_packet.js';

const server = http.createServer(handleServer);
const io = new Server(server);

const PORT: number = 3000

let activeGame: Game;
let lastWinner: PlayerType = PlayerType.None;
let updateTimer: NodeJS.Timer;

const MIME_TYPES: { [key: string]: string } = {
    css: "text/css",
    gif: "image/gif",
    htm: "text/html",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "text/javascript",
    json: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    txt: "text/plain"
}

function get_mime(filename: string): string {
    for (let ext in MIME_TYPES) {
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return MIME_TYPES[ext];
        }
    }
    return MIME_TYPES["txt"];
}

function handleServer(req: http.IncomingMessage, res: http.ServerResponse) {
    let urlObj = url.parse(req.url, true, false);

    let receivedData: string = "";
    let dataObj: any = null;
    let returnObj: any = null;

    req.on("data", chunk => {
        receivedData += chunk;
    });

    req.on("end", () => {
        if (req.method === "GET") {
            // We want to be able to share files in `common` between the server and the client
            // It contains a lot of shared data strucutres
            // This will allow us to
            const commonExp = /^\/?common\/.*$/.exec(urlObj.pathname);

            let tmpRootDir = "";
            if (commonExp === null)
                tmpRootDir = "client";
            else
                tmpRootDir = "." // This will allow use to serve js files located in common


            let filePath = tmpRootDir + urlObj.pathname;
            if (urlObj.pathname === '/') filePath = tmpRootDir + "/curling.html";

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error("ERROR: " + JSON.stringify(err));

                    res.writeHead(404);
                    res.end(JSON.stringify(err));
                    return;
                }
                res.writeHead(200, {
                    "Content-Type": get_mime(filePath)
                });
                res.end(data);
            })
        }
    })
}

let networker = new ServerNetworker(io, onDisconnect);

let players: { [id: string]: Player } = {}

function getRolesTaken(): [boolean, boolean] {
    let visitorTaken = false;
    let homeTaken = false;
    for (const id in players) {
        const element = players[id];
        if (element.type == PlayerType.Home)
            homeTaken = true;
        else if (element.type == PlayerType.Visitor)
            visitorTaken = true;
    }

    return [homeTaken, visitorTaken];
}

networker.registerPacket(HelloPacket, (p, s) => {
    console.log(`${s.id} says ${p.message}`);
});
networker.registerPacket(ReadyPacket, (p, s) => {
    players[s.id] = new Player(s.id, PlayerType.None);
    const rolesTaken = getRolesTaken();
    networker.sendToPlayer(players[s.id], new StartInfoPacket(rolesTaken[0], rolesTaken[1]));
})
networker.registerPacket(RequestRolePacket, (p, s) => {
    let rolesTaken = getRolesTaken();
    let homeTaken = rolesTaken[0];
    let visitorTaken = rolesTaken[1];

    if (p.role == PlayerType.Spectator) {
        players[s.id].type = PlayerType.Spectator;
        networker.sendToPlayer(players[s.id], new ProvideRolePacket(PlayerType.Spectator));
        networker.send(new RoleTakenPacket(PlayerType.Spectator), players[s.id]);
        // There is a chance they joined after the game started so we need to update them
        if (activeGame !== undefined) {
            // There is an ongoing game
            // Get the stone ids
            let hStones: number[] = [];
            let vStones: number[] = [];
            activeGame.stones.data.forEach(stone => {
                if (stone.team === PlayerType.Home)
                    hStones.push(stone.id);
                else if (stone.team === PlayerType.Visitor)
                    vStones.push(stone.id);
            });
            networker.sendToPlayer(players[s.id], new StartGamePacket(hStones, vStones, activeGame.space.bounds.size));
        }
    }
    else if (p.role == PlayerType.Visitor) {
        if (visitorTaken) {
            networker.sendToPlayer(players[s.id], new ProvideRolePacket(PlayerType.None));
        }
        else {
            players[s.id].type = PlayerType.Visitor;
            networker.sendToPlayer(players[s.id], new ProvideRolePacket(PlayerType.Visitor));
            networker.send(new RoleTakenPacket(PlayerType.Visitor), players[s.id]);
        }
    }
    else if (p.role == PlayerType.Home) {
        if (homeTaken) {
            networker.sendToPlayer(players[s.id], new ProvideRolePacket(PlayerType.None));
        }
        else {
            players[s.id].type = PlayerType.Home;
            networker.sendToPlayer(players[s.id], new ProvideRolePacket(PlayerType.Home));
            networker.send(new RoleTakenPacket(PlayerType.Home), players[s.id]);
        }
    }

    rolesTaken = getRolesTaken();
    homeTaken = rolesTaken[0];
    visitorTaken = rolesTaken[1];
    if (homeTaken && visitorTaken && p.role !== PlayerType.Spectator) {
        // We can now start the game!
        activeGame = new Game(new Subspace(new Rectangle(
            Vec2.zero(),
            new Vec2(1000, 900)
        )));

        // Create the IDs for the stones
        let hStones: number[] = [];
        let vStones: number[] = [];
        for (let i = 0; i < 5; i++)
            hStones.push(i);
        for (let i = 5; i < 10; i++)
            vStones.push(i);

        activeGame.createStones(hStones, vStones);
        activeGame.ice.organizeStones(activeGame);

        networker.send(new StartGamePacket(hStones, vStones, activeGame.space.bounds.size));
        if(lastWinner === PlayerType.None)
            activeGame.turn = PlayerType.Home;
        else if (lastWinner === PlayerType.Home)
            activeGame.turn = PlayerType.Home;
        else if (lastWinner === PlayerType.Visitor)
            activeGame.turn = PlayerType.Visitor;
        networker.send(new ChangeTurnPacket(activeGame.turn)); // Home can go first
        updateTimer = setInterval(() => {
            if(activeGame !== undefined) {
                // It is possible that the game is over yet this is still called
                activeGame.stones.data.forEach(stone => {
                    stone.update();
                });
                activeGame.resolveCollisions();
                updateStonePositions();
            }
        }, 1000/30); // Update 30 times per second
    }
});
networker.registerPacket(UpdatePositionPacket, (p, s) => {
    if (activeGame !== undefined) {
        activeGame.getStoneById(p.stoneId).position = p.position;

        // Update everybody else
        networker.send(new UpdatePositionPacket(p.stoneId, p.position), players[s.id]);
    }
});
networker.registerPacket(ShootStonePacket, (p, s) => {
    if (activeGame !== undefined) {
        let stone = activeGame.getStoneById(p.stoneId);
        stone.beenShot = true;
        stone.velocity = p.velocity;
        // Change over the turns
        if (activeGame.turn === PlayerType.Home) {
            // Switch to visitor
            activeGame.turn = PlayerType.Visitor;
            networker.send(new ChangeTurnPacket(PlayerType.Visitor));
        }
        else {
            // Switch to home
            activeGame.turn = PlayerType.Home;
            networker.send(new ChangeTurnPacket(PlayerType.Home));
        }

        // If all the stones have been shot the game is over and the winner will be declared
        let allShot = true;
        activeGame.stones.data.forEach(stone => {
            if (stone.beenShot === false)
                allShot = false;
        });
        if (allShot) {
            setTimeout(() => {
                // Find the winner
                let scores = activeGame.getScores();
                if (scores.home > scores.visitor) {
                    // Home wins
                    resetGame(PlayerType.Home);
                }
                else if (scores.visitor > scores.home) {
                    // Visitor wins
                    resetGame(PlayerType.Visitor);
                }
                else {
                    // Tie (spectator is a special case)
                    resetGame(PlayerType.Spectator);
                }
            }, 1500); // Wait about 1.5s before saying who won
        }
    }
});
networker.registerPacket(UpdateCueAimPacket, (p, s) => {
    // Forward to spectators
    for (const id in players) {
        const player = players[id];
        if (player.type === PlayerType.Spectator)
            networker.sendToPlayer(player, new UpdateCueAimPacket(p.action, p.position));
    }
});

// Update the stone posotions to the clients
function updateStonePositions() {
    let num = activeGame.stones.length();
    for (let i = 0; i < num; i++) {
        if(activeGame !== undefined) {
            let stone = activeGame.stones.get(i);
            networker.send(new UpdatePositionPacket(stone.id, stone.position));
        }
        else
            break;
    }
}

function onDisconnect(socket: Socket) {
    const player = players[socket.id];
    if (player.type === PlayerType.Spectator) {
        // We don't really need to do anything other than remove the player
        delete players[socket.id];
    }
    else if (player.type === PlayerType.Home || player.type === PlayerType.Visitor) {
        // Reset the game
        delete players[socket.id];
        resetGame(PlayerType.None);
    }
}

function resetGame(winner: PlayerType) {
    clearInterval(updateTimer);
    players = {};
    networker.send(new EndGamePacket(winner));
    activeGame = undefined;
    lastWinner = winner;
}

server.listen(PORT);

console.log(`Server running on port ${PORT}`);
console.log('Play at http://localhost:3000/curling.html');