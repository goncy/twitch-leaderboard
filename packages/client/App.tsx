import React from "react";
import io from "socket.io-client";

import {SERVER_URL} from "./constants";
import {Player} from "./types";

const socket = io(SERVER_URL);

const App: React.FC = () => {
  const [players, setPlayers] = React.useState<null | Player[]>(null);

  React.useEffect(() => {
    socket.on("players", (state: Player[]) => setPlayers(state));
  }, []);

  if (!players) return null;

  return (
    <div className="nes-container with-title is-centered" id="board">
      <p className="title">Leaderboard</p>
      <ul className="nes-list is-disc">
        {[...players]
          .sort((a, b) => b.points - a.points)
          .slice(0, 5)
          .map((player) => (
            <li key={player.username}>
              {player.username} ({player.points})
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;
