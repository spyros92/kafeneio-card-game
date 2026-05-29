import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { Card, Room } from "./types";

import {
    createDeck,
    shuffleDeck,
    dealCards,
    determineTrickWinner,
    calculateScore,
    mustFollowSuit,
    getValidCards,
} from "./game";

import {
    MAX_PLAYERS,
    TOTAL_CARDS,
    BID_TIME_MS,
    PLAY_TIME_MS,
    TRICK_RESOLVE_TIME_MS,
    BOT_DELAY_MS,
    MAX_ROUNDS,
    GAME_RESET_DELAY_MS,
} from "./config";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = new Map<string, Room>();

function chooseBotCard(
    room: Room,
    playerId: string,
    validCards: Card[]
) {

    const bid =
        room.bids[playerId] || 0;

    const tricksWon =
        room.tricksWon[playerId] || 0;

    const needsTricks =
        tricksWon < bid;

    const trumpSuit =
        room.trumpCard?.suit;

    const sortedCards =
        [...validCards].sort(
            (a, b) =>
                a.value - b.value
        );

    if (!needsTricks) {

        const nonTrumpCards =
            sortedCards.filter(
                (card) =>
                    card.suit !== trumpSuit
            );

        return (
            nonTrumpCards[0] ||
            sortedCards[0]
        );
    }

    const trumpCards =
        sortedCards.filter(
            (card) =>
                card.suit === trumpSuit
        );

    return (
        trumpCards.at(-1) ||
        sortedCards.at(-1)!
    );
}
function processBotTurn(room: Room, roomId: string) {

    const currentPlayer =
        room.players[
            room.currentTurnIndex
            ];

    if (
        !currentPlayer ||
        !currentPlayer.isBot
    ) {
        return;
    }

    setTimeout(() => {

        const stillCurrentPlayer = room.players[room.currentTurnIndex];

        if (!stillCurrentPlayer || stillCurrentPlayer.id !== currentPlayer.id) {
            return;
        }

        if (room.isResolvingTrick) {
            return;
        }

        if (room.phase === "bidding") {

            const bidOptions = Array.from({ length: room.round + 1 }, (_, index) => index);

            const playersAlreadyBid = Object.keys(room.bids).length;
            const isLastBidder = playersAlreadyBid === room.players.length - 1;
            const totalPreviousBids = Object.values(room.bids).reduce((sum, currentBid) => sum + currentBid, 0);

            const validBidOptions = bidOptions.filter((option) => {
                if (!isLastBidder) return true;
                return totalPreviousBids + option !== room.round;
            });

            const randomBid = validBidOptions[Math.floor(Math.random() * validBidOptions.length)] ?? 0;

            handlePlaceBid(
                room,
                currentPlayer.id,
                randomBid,
                roomId
            );

        } else if (
            room.phase === "playing"
        ) {

            const playerHand =
                room.hands[
                    currentPlayer.id
                    ];

            if (
                !playerHand ||
                playerHand.length === 0
            ) {
                return;
            }

            const leadSuit =
                room.tableCards[0]
                    ?.card.suit;

            const validCards =
                getValidCards(
                    playerHand,
                    leadSuit,
                    room.trumpCard?.suit
                );

            const botCard =
                chooseBotCard(
                    room,
                    currentPlayer.id,
                    validCards
                );

            handlePlayCard(
                room,
                currentPlayer.id,
                botCard,
                roomId
            );
        }

    }, BOT_DELAY_MS);
}
setInterval(() => {
    for (const room of rooms.values()) {

        if (
            room.phase !== "bidding" &&
            room.phase !== "playing"
        ) {
            continue;
        }

        if (!room.turnEndsAt) {
            continue;
        }

        if (Date.now() < room.turnEndsAt) {
            continue;
        }

        const currentPlayer =
            room.players[
                room.currentTurnIndex
                ];

        if (!currentPlayer) {
            continue;
        }

        if (room.phase === "bidding") {

            if (
                room.bids[currentPlayer.id] ===
                undefined
            ) {

                handlePlaceBid(room, currentPlayer.id, 0, room.id);
            }

        } else if (room.phase === "playing") {

            const playerHand =
                room.hands[currentPlayer.id];

            if (
                !playerHand ||
                playerHand.length === 0
            ) {
                continue;
            }

            const leadSuit =
                room.tableCards[0]?.card.suit;

            const validCards =
                getValidCards(
                    playerHand,
                    leadSuit,
                    room.trumpCard?.suit
                );

            const botCard =
                chooseBotCard(
                    room,
                    currentPlayer.id,
                    validCards
                );

            handlePlayCard(
                room,
                currentPlayer.id,
                botCard,
                room.id
            );
        }
    }
}, 1000);
app.get("/", (_req, res) => {
  res.send("Kafeneio server is running");
});

function handlePlaceBid(
    room: Room,
    playerId: string,
    bid: number,
    roomId: string
) {

    if (room.phase !== "bidding") {
        return;
    }

    if (room.bids[playerId] !== undefined) {
        return;
    }

    if (bid < 0 || bid > room.round) {
        return;
    }

    const currentPlayer =
        room.players[
            room.currentTurnIndex
            ];

    if (
        currentPlayer.id !== playerId
    ) {
        return;
    }

    const playersAlreadyBid =
        Object.keys(
            room.bids
        ).length;

    const isLastBidder =
        playersAlreadyBid ===
        room.players.length - 1;

    if (isLastBidder) {

        const totalPreviousBids =
            Object.values(
                room.bids
            ).reduce(
                (sum, currentBid) =>
                    sum + currentBid,
                0
            );

        const totalWithCurrentBid =
            totalPreviousBids + bid;

        if (
            totalWithCurrentBid ===
            room.round
        ) {
            return;
        }
    }

    room.bids[playerId] = bid;

    const allPlayersBid =
        room.players.every(
            (player) =>
                room.bids[
                    player.id
                    ] !== undefined
        );

    if (allPlayersBid) {

        room.phase = "playing";

        room.currentTurnIndex =
            (
                room.dealerIndex + 1
            ) %
            room.players.length;

        room.turnEndsAt =
            Date.now() + PLAY_TIME_MS

    } else {

        room.currentTurnIndex =
            (
                room.currentTurnIndex + 1
            ) %
            room.players.length;

        room.turnEndsAt =
            Date.now() + BID_TIME_MS
    }

    io.to(roomId).emit(
        "room-updated",
        room
    );

    processBotTurn(
        room,
        roomId
    );
}
function startNewRound(
    room: Room
) {

    room.tableCards = [];
    room.isResolvingTrick = false;
    room.lastTrickWinnerId = null;

    const newDeck =
        shuffleDeck(
            createDeck()
        );

    const playerIds =
        room.players.map(
            (player) => player.id
        );

    room.hands =
        dealCards(
            newDeck,
            playerIds,
            room.round
        );

    room.trumpCard =
        newDeck.pop() || null;

    room.currentTurnIndex =
        (
            room.dealerIndex + 1
        ) %
        room.players.length;

    room.turnEndsAt =
        Date.now() + BID_TIME_MS

    room.phase =
        "bidding";

    room.bids = {};

    room.tricksWon = {};
}
function finishGame(
    room: Room
) {
    room.phase = "finished";
    room.turnEndsAt = null;

    setTimeout(() => {
        room.round = 1;
        room.dealerIndex = 0;
        room.currentTurnIndex = 0;
        room.trumpCard = null;
        room.hands = {};
        room.bids = {};
        room.tricksWon = {};
        room.scores = {};
        room.roundHistory = [];
        room.tableCards = [];
        room.isResolvingTrick = false;
        room.lastTrickWinnerId = null;
        room.turnEndsAt = null;
        room.phase = "waiting";

        io.to(room.id).emit("room-updated", room);
    }, GAME_RESET_DELAY_MS);
}
function finishRound(
    room: Room
) {

    for (const player of room.players) {

        const bid =
            room.bids[player.id] || 0;

        const tricksWon =
            room.tricksWon[player.id] || 0;

        let score = 0;

        const difference =
            Math.abs(
                bid - tricksWon
            );

        if (bid === tricksWon) {

            score =
                15 +
                (tricksWon * 10);

        } else {

            score =
                -20 -
                (difference * 5);
        }

        const totalScore =
            (room.scores[player.id] || 0) + score;

        room.scores[player.id] = totalScore;

        room.roundHistory.push({
            round: room.round,
            playerId: player.id,
            bid,
            tricksWon,
            roundScore: score,
            totalScore,
        });
    }

    if (room.round >= MAX_ROUNDS) {

        finishGame(room);

        return;
    }

    room.round += 1;

    room.dealerIndex =
        (
            room.dealerIndex + 1
        ) %
        room.players.length;

    startNewRound(room);
}
function resolveTrick(
    room: Room,
    roomId: string
) {

    const winnerId =
        determineTrickWinner(
            room.tableCards,
            room.trumpCard!.suit
        );

    room.tricksWon[
        winnerId
        ] =
        (
            room.tricksWon[
                winnerId
                ] || 0
        ) + 1;

    const winnerIndex =
        room.players.findIndex(
            (p) =>
                p.id === winnerId
        );

    room.currentTurnIndex =
        winnerIndex;


    room.turnEndsAt = null;

    room.lastTrickWinnerId =
        winnerId;

    io.to(roomId).emit(
        "room-updated",
        room
    );

    setTimeout(() => {

        room.tableCards = [];

        room.isResolvingTrick =
            false;

        const everyoneOutOfCards =
            Object.values(
                room.hands
            ).every(
                (hand) =>
                    hand.length === 0
            );

        if (everyoneOutOfCards) {

            finishRound(room);

        } else {

            room.turnEndsAt =
                Date.now() + PLAY_TIME_MS
        }

        io.to(roomId).emit(
            "room-updated",
            room
        );

        processBotTurn(
            room,
            roomId
        );

    }, TRICK_RESOLVE_TIME_MS);
}
function handlePlayCard(
    room: Room,
    playerId: string,
    card: Card,
    roomId: string
) {
    if (
        room.phase !== "playing" ||
        room.isResolvingTrick
    ) {
        return;
    }

    const currentPlayer =
        room.players[
            room.currentTurnIndex
            ];

    if (
        currentPlayer.id !== playerId
    ) {
        return;
    }

    const playerHand =
        room.hands[playerId];

    const leadCard =
        room.tableCards[0];

    if (leadCard) {
        const leadSuit = leadCard.card.suit;
        const trumpSuit = room.trumpCard?.suit;

        const playerHasLeadSuit = playerHand.some((c) => c.suit === leadSuit);
        const playerHasTrump = trumpSuit
            ? playerHand.some((c) => c.suit === trumpSuit)
            : false;

        if (playerHasLeadSuit && card.suit !== leadSuit) {
            return;
        }

        if (!playerHasLeadSuit && playerHasTrump && card.suit !== trumpSuit) {
            return;
        }
    }

    const hasCard =
        playerHand.some(
            (c) =>
                c.suit === card.suit &&
                c.value === card.value
        );

    if (!hasCard) {
        return;
    }

    room.hands[playerId] =
        playerHand.filter(
            (c) =>
                !(
                    c.suit === card.suit &&
                    c.value === card.value
                )
        );

    room.tableCards.push({
        playerId,
        card,
    });

    const everyonePlayed =
        room.tableCards.length ===
        room.players.length;

    if (
        everyonePlayed &&
        !room.isResolvingTrick
    ) {

        room.isResolvingTrick = true;

        resolveTrick(
            room,
            roomId
        );

    } else {

        room.currentTurnIndex =
            (
                room.currentTurnIndex + 1
            ) %
            room.players.length;

        room.turnEndsAt =
            Date.now() + PLAY_TIME_MS

        io.to(roomId).emit(
            "room-updated",
            room
        );

        processBotTurn(
            room,
            roomId
        );
    }
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

    socket.on("leave-room", ({ roomId }) => {
        const room = rooms.get(roomId);

        if (!room) {
            return;
        }

        room.players = room.players.filter((player) => player.id !== socket.id);

        socket.leave(roomId);

        if (room.players.length === 0) {
            rooms.delete(roomId);
            return;
        }

        io.to(roomId).emit("room-updated", room);
    });

  socket.on("create-room", ({ name }) => {
    const roomId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const room: Room = {
        id: roomId,

        hostId: socket.id,
        players: [
            {
                id: socket.id,
                name,
                connected: true,
                isBot: false,
            },
        ],

        phase: "waiting",

        round: 1,

        dealerIndex: 0,

        currentTurnIndex: 0,

        trumpCard: null,

        hands: {},

        bids: {},

        tricksWon: {},

        scores: {},

        roundHistory: [],

        tableCards: [],

        isResolvingTrick: false,

        lastTrickWinnerId: null,

        turnEndsAt: null,
    };

    rooms.set(roomId, room);

    socket.join(roomId);

    io.to(roomId).emit(
        "room-updated",
        room
    );

    console.log(
        `Room created: ${roomId}`
    );
  });

  socket.on("create-singleplayer", ({ name }) => {

        const roomId =
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

        const room: Room = {
            id: roomId,

            hostId: socket.id,

            players: [
                {
                    id: socket.id,
                    name,
                    connected: true,
                    isBot: false,
                },

                {
                    id: "bot-1",
                    name: "Bot 1",
                    connected: true,
                    isBot: true,
                },

                {
                    id: "bot-2",
                    name: "Bot 2",
                    connected: true,
                    isBot: true,
                },

                {
                    id: "bot-3",
                    name: "Bot 3",
                    connected: true,
                    isBot: true,
                },
            ],

            phase: "waiting",

            round: 1,

            dealerIndex: 0,

            currentTurnIndex: 0,

            trumpCard: null,

            hands: {},

            bids: {},

            tricksWon: {},

            scores: {},

            roundHistory: [],

            tableCards: [],

            isResolvingTrick: false,

            lastTrickWinnerId: null,

            turnEndsAt: null,
        };

        rooms.set(roomId, room);

        socket.join(roomId);

        startNewRound(room);

        io.to(roomId).emit(
          "game-started",
          { room }
        );

        processBotTurn(
          room,
          roomId
        );
    });

  socket.on("start-game", ({ roomId }) => {
    const room =
        rooms.get(roomId);

    if (!room) {
      return;
    }
    if (room.hostId !== socket.id) {
      socket.emit(
          "error-message",
          "Μόνο ο host μπορεί να ξεκινήσει το παιχνίδι"
      );

      return;
    }

    if (room.players.length < 2) {
      socket.emit(
          "error-message",
          "Χρειάζονται τουλάχιστον 2 παίκτες για να ξεκινήσει το παιχνίδι"
      );

      return;
    }

    if (room.phase !== "waiting") {
      socket.emit(
          "error-message",
          "Το παιχνίδι έχει ήδη ξεκινήσει"
      );

      return;
    }

    startNewRound(room);

      io.to(roomId).emit(
          "room-updated",
          room
      );

      processBotTurn(
          room,
          roomId
      );

    console.log(
        "Game started:",
        roomId
    );
  });

  socket.on("place-bid", ({ roomId, bid }) => {

        const room =
            rooms.get(roomId);

        if (!room) {
            return;
        }

        handlePlaceBid(
            room,
            socket.id,
            bid,
            roomId
        );
    });

  socket.on("play-card", ({ roomId, card }) => {

        const room =
            rooms.get(roomId);

        if (!room) {
            return;
        }

        handlePlayCard(
            room,
            socket.id,
            card,
            roomId
        );
    });

  socket.on("join-room", ({ roomId, name }) => {
        const room =
            rooms.get(roomId);

        if (!room) {
            socket.emit(
                "error-message",
                "Room not found"
            );

            return;
        }

        if (room.phase !== "waiting") {
            socket.emit(
                "error-message",
                "Το παιχνίδι έχει ήδη ξεκινήσει"
            );

            return;
        }

      if (room.players.length >= MAX_PLAYERS) {
            socket.emit(
                "error-message",
                "Το δωμάτιο είναι γεμάτο"
            );

            return;
        }

        const nameAlreadyExists =
            room.players.some(
                (player) =>
                    player.name
                        .trim()
                        .toLowerCase() ===
                    name
                        .trim()
                        .toLowerCase()
            );

        if (nameAlreadyExists) {
            socket.emit(
                "error-message",
                "Το όνομα χρησιμοποιείται ήδη"
            );

            return;
        }

      const disconnectedPlayer =
          room.players.find(
              (player) =>
                  player.name
                      .trim()
                      .toLowerCase() ===
                  name
                      .trim()
                      .toLowerCase() &&
                  !player.connected
          );

      if (disconnectedPlayer) {
          disconnectedPlayer.id =
              socket.id;

          disconnectedPlayer.connected =
              true;
      } else {
          room.players.push({
              id: socket.id,
              name,
              connected: true,
              isBot: false,
          });
      }

        socket.join(roomId);

        io.to(roomId).emit(
            "room-updated",
            room
        );

        console.log(
            `${name} joined room ${roomId}`
        );
    });

  socket.on("disconnect", () => {
        console.log(
            "User disconnected:",
            socket.id
        );

        for (const [
            roomId,
            room,
        ] of rooms.entries()) {

            const player =
                room.players.find(
                    (p) =>
                        p.id === socket.id
                );

            if (!player) {
                continue;
            }

            player.connected = false;

            const everyoneDisconnected =
                room.players.every(
                    (p) => !p.connected
                );

            if (everyoneDisconnected) {
                rooms.delete(roomId);

                console.log(
                    `Room ${roomId} deleted`
                );
            } else {
                io.to(roomId).emit(
                    "room-updated",
                    room
                );
            }
        }
    });

});

server.listen(3001, () => {
  console.log(
      "Server listening on port 3001"
  );
});