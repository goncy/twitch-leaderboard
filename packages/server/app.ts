import * as http from "http";

import * as io from "socket.io";
import * as tmi from "tmi.js";
import axios from "axios";

import {API_URL, CHANNEL, IO_PORT, HTTP_PORT, TOKEN} from "./constants";
import {Player} from "./types";

let players: Player[] = [];
const server = io.listen(IO_PORT);
const client = tmi.client({
  identity: {
    username: CHANNEL,
    password: TOKEN,
  },
  channels: [CHANNEL],
});

async function sync() {
  players = await axios.get(`${API_URL}/players`).then((res) => res.data);

  server.emit("players", players);
}

server.on("connection", (socket) => socket.emit("players", players));

client.on("message", async (_target, context, message) => {
  if (context.username === CHANNEL && message.includes("!points")) {
    const [, username, points] = message.split(" ");

    const [user] = await axios
      .get(`${API_URL}/players?username=${username}`)
      .then((res) => res.data);

    if (user) {
      await axios.put(`${API_URL}/players/${user.id}`, {points: user.points + Number(points)});

      client.say(
        CHANNEL,
        `${username} sumó ${points} puntos! Acumula ${Number(points) + user.points}`,
      );

      sync();
    } else {
      await axios.post(`${API_URL}/players`, {
        username,
        points,
      });

      client.say(CHANNEL, `${username} obtuvo sus primeros ${points} puntos!`);

      sync();
    }
  }
});

http
  .createServer(async (_req, res) => {
    await sync();

    res.end();
  })
  .listen(HTTP_PORT, async () => {
    await sync();

    client.connect();
  });
