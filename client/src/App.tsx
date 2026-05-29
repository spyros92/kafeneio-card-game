import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { CardView } from "./components/CardView";
import { Hand } from "./components/Hand";
import { Table } from "./components/Table";
import { Opponents } from "./components/Opponents";
import { ScoreBoard } from "./components/ScoreBoard";
import { ScoreHud } from "./components/ScoreHud";
import { GameHeader } from "./components/GameHeader";
import { PlayersList } from "./components/PlayersList";
import { BiddingPanel } from "./components/BiddingPanel";
import { Lobby } from "./components/Lobby";
import { EndGameModal } from "./components/EndGameModal";
import { getPlayersFromMyView } from "./utils/seating";
import { TableScene } from "./components/TableScene";
import { TimerHud } from "./components/TimerHud";
import { MyPredictionHud } from "./components/MyPredictionHud";

const socket: Socket = io("http://91.99.157.22:3001");

type Card = {
    suit: string;
    value: number;
};

type Player = {
    id: string;
    name: string;
};

type Room = {
    id: string;
    hostId: string;
    players: Player[];
    phase: string;
    round: number;
    trumpCard: Card | null;
    hands: Record<string, Card[]>;
    bids: Record<string, number>;
    roundHistory: {
        round: number;
        playerId: string;
        bid: number;
        tricksWon: number;
        roundScore: number;
        totalScore: number;
    }[];
    tableCards: {
        playerId: string;
        card: Card;
    }[];
    scores: Record<string, number>;
    currentTurnIndex: number;
    tricksWon: Record<string, number>;
};

function App() {
    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [room, setRoom] = useState<Room | null>(null);
    const [hand, setHand] = useState<Card[]>([]);
    const [trumpCard, setTrumpCard] = useState<Card | null>(null);
    const [error, setError] = useState("");
    const [bid, setBid] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        socket.on("room-updated", (updatedRoom: Room) => {
            setRoom(updatedRoom);
            setHand(updatedRoom.hands?.[socket.id] || []);
            setTrumpCard(updatedRoom.trumpCard);
            setError("");
        });

        socket.on("game-started", ({ room }: { room: Room }) => {
            setRoom(room);
            setHand(room.hands[socket.id] || []);
            setTrumpCard(room.trumpCard);
            setError("");
        });

        socket.on("error-message", (message: string) => {
            setError(message);
        });

        return () => {
            socket.off("room-updated");
            socket.off("game-started");
            socket.off("error-message");
        };
    }, []);

    useEffect(() => {
        if (!room?.turnEndsAt) {
            setTimeLeft(0);
            return;
        }

        const interval = setInterval(() => {
            const remaining = Math.max(
                0,
                Math.ceil((room.turnEndsAt! - Date.now()) / 1000)
            );

            setTimeLeft(remaining);
        }, 250);

        return () => {
            clearInterval(interval);
        };
    }, [room?.turnEndsAt]);

    const createRoom = () => {
        if (!name.trim()) {
            setError("Βάλε όνομα πρώτα");
            return;
        }

        socket.emit("create-room", { name });
    };

    const createSingleplayer = () => {
        if (!name.trim()) {
            setError("Βάλε όνομα πρώτα");
            return;
        }

        socket.emit("create-singleplayer", {
            name,
        });
    };

    const joinRoom = () => {
        if (!name.trim()) {
            setError("Βάλε όνομα πρώτα");
            return;
        }

        if (!roomId.trim()) {
            setError("Βάλε Room ID");
            return;
        }

        socket.emit("join-room", {
            roomId: roomId.trim().toUpperCase(),
            name,
        });
    };

    const startGame = () => {
        if (!room) return;

        socket.emit("start-game", {
            roomId: room.id,
        });
    };

    const placeBid = () => {
        if (!room) return;

        const parsedBid = Number(bid);

        if (Number.isNaN(parsedBid)) {
            setError("Το bid πρέπει να είναι αριθμός");
            return;
        }

        socket.emit("place-bid", {
            roomId: room.id,
            bid: parsedBid,
        });
    };

    const playCard = (card: Card) => {
        if (!room) return;

        socket.emit("play-card", {
            roomId: room.id,
            card,
        });
    };

    const exitGame = () => {
        if (room?.id) {
            socket.emit("leave-room", { roomId: room.id });
        }

        setRoom(null);
        setHand([]);
        setTrumpCard(null);
        setBid("");
        setRoomId("");
        setError("");
    };

    const currentPlayer =
        room?.players[room.currentTurnIndex];

    const isMyTurn =
        currentPlayer?.id === socket.id;

    const me = room?.players.find(
        (player) => player.id === socket.id
    );

    const opponents =
        room?.players.filter(
            (player) => player.id !== socket.id
        ) || [];

    const playersFromMyView = room
        ? getPlayersFromMyView(
            room.players,
            socket.id
        )
        : [];

    const meFromView =
        playersFromMyView[0];

    const opponentsFromView =
        playersFromMyView.slice(1);

    const leftPlayer =
        opponentsFromView[0];

    const topPlayer =
        opponentsFromView[1];

    const rightPlayer =
        opponentsFromView[2];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 text-white ">


            {error && (
                <p style={{color: "red"}}>
                {error}
                </p>
            )}

            {!room && (
                <Lobby
                    name={name}
                    setName={setName}
                    roomId={roomId}
                    setRoomId={setRoomId}
                    createRoom={createRoom}
                    joinRoom={joinRoom}
                    createSingleplayer={createSingleplayer}
                />
            )}

            {room && (
                <div className="w-screen h-screen overflow-hidden flex items-center justify-center">

                    <ScoreHud
                        players={room.players}
                        roundHistory={room.roundHistory}
                    />
                    <button
                        onClick={exitGame}
                        className="absolute top-0  z-50 bg-black/55 border border-red-400/40 text-red-200 w-40 h-9
                         px-4 py-2 rounded-xl font-bold shadow-xl backdrop-blur-md hover:bg-red-900/60 transition"
                    >
                        Exit Game
                    </button>
                    <MyPredictionHud
                        bid={meFromView ? room.bids[meFromView.id] : undefined}
                        tricksWon={meFromView ? room.tricksWon[meFromView.id] || 0 : 0}
                    />

                    <TimerHud
                        timeLeft={timeLeft}
                        phase={room.phase}
                    />

                    {room.phase === "finished" && (
                        <EndGameModal
                            players={room.players}
                            scores={room.scores}
                        />
                    )}

                    {room.phase === "waiting" &&
                        room.hostId === socket.id && (
                            <button
                                onClick={startGame}
                                className="absolute top-6 right-6 z-50 bg-green-600 px-6 py-3 rounded-xl font-bold"
                            >
                                Start Game
                            </button>
                        )}

                    {room.phase === "waiting" &&
                        room.hostId !== socket.id && (
                            <div className="absolute top-6 right-6 z-50 bg-black/50 px-6 py-3 rounded-xl">
                                Περιμένουμε τον host...
                            </div>
                        )}

                    {room.phase === "bidding" && (
                        <div className="absolute bottom-10 right-10 z-50">
                            <BiddingPanel
                                bid={bid}
                                setBid={setBid}
                                placeBid={placeBid}
                                round={room.round}
                                players={room.players}
                                bids={room.bids}
                            />
                        </div>
                    )}

                    {room.phase !== "waiting" && (
                        <TableScene
                            me={meFromView}
                            leftPlayer={leftPlayer}
                            topPlayer={topPlayer}
                            rightPlayer={rightPlayer}
                            hands={room.hands}
                            hand={hand}
                            tableCards={room.tableCards}
                            bids={room.bids}
                            tricksWon={room.tricksWon}
                            trumpCard={room.trumpCard}
                            players={room.players}
                            currentPlayerId={currentPlayer?.id}
                            isMyTurn={isMyTurn}
                            phase={room.phase}
                            isResolvingTrick={room.isResolvingTrick}
                            lastTrickWinnerId={room.lastTrickWinnerId}
                            playCard={playCard}
                        />
                    )}

                </div>
            )}
        </div>
    );
}

export default App;