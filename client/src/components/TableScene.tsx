import { Hand } from "./Hand";
import { Table } from "./Table";

type Card = {
    suit: string;
    value: number;
};

type Player = {
    id: string;
    name: string;
    connected: boolean;
    isBot: boolean;
};

type TableCard = {
    playerId: string;
    card: Card;
};

type TableSceneProps = {
    me?: Player;
    leftPlayer?: Player;
    topPlayer?: Player;
    rightPlayer?: Player;
    hands: Record<string, Card[]>;
    hand: Card[];
    tableCards: TableCard[];
    trumpCard: Card | null;
    players: Player[];
    currentPlayerId?: string;
    bids: Record<string, number>;
    tricksWon: Record<string, number>;
    isMyTurn: boolean;
    phase: string;
    isResolvingTrick: boolean;
    lastTrickWinnerId: string | null;
    playCard: (card: Card) => void;
};

function PlayerSeat({
        player,
        cards,
        active,
        position,
        bid,
        tricksWon,
    }: {
    player?: Player;
    cards?: Card[];
    active: boolean;
    position: "left" | "top" | "right";
    bid?: number;
    tricksWon?: number;
}) {
    if (!player) {
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-6">
            <div
                className={`bg-black/55 border border-amber-200/20 rounded-xl px-4 py-2 min-w-32 text-center backdrop-blur-sm shadow-xl ${
                    active
                        ? "ring-4 ring-yellow-400"
                        : ""
                }`}
            >
                <div className="font-bold text-white">
                    {player.name}
                    {player.isBot ? " 🤖" : ""}
                    {!player.connected ? " 🔴" : ""}
                </div>

                {bid !== undefined && (
                    <div className="flex justify-center gap-1 mt-2">
                        {Array.from({ length: Math.max(bid, tricksWon || 0) }).map((_, index) => {

                            const isCorrect =
                                index < bid &&
                                index < (tricksWon || 0);

                            const isExtra =
                                index >= bid &&
                                index < (tricksWon || 0);

                            return (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full border border-white/50 ${
                                        isCorrect
                                            ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                                            : isExtra
                                                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                                                : "bg-black/40"
                                    }`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={`flex justify-center items-center
                ${position === "flex-row"}`}
            >
                {Array.from({length: 5}).map((_, i) => {
                    const middle = (5 - 1) / 2;
                    const offset = i - middle;

                    const rotate = offset * 8;

                    const translate = Math.abs(offset) * 8;

                    return (
                        <div
                            key={i}
                            style={{
                                transform: `rotate(${rotate}deg) translateY(${translate}px)`,
                                marginLeft: "-24px",
                                backgroundImage: "url('/card-bg.png')",
                            }}
                            className="w-11 h-16 rounded-md shadow-2xl bg-cover bg-center border border-white/40"
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function TableScene({
                               me,
                               leftPlayer,
                               topPlayer,
                               rightPlayer,
                               hands,
                               hand,
                               tableCards,
                               trumpCard,
                               players,
                               bids,
                               tricksWon,
                               currentPlayerId,
                               isMyTurn,
                               phase,
                               isResolvingTrick,
                               lastTrickWinnerId,
                               playCard,
                           }: TableSceneProps) {

    return (
        <div
            className="relative w-full max-w-7xl h-[900px] mt-8 overflow-hidden rounded-[2rem] shadow-2xl bg-cover bg-center"
            style={{
                backgroundImage: "url('/kafeneio-bg.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >

            <div className="absolute top-24 left-1/2 -translate-x-1/2">
                <PlayerSeat
                    position="top"
                    player={topPlayer}
                    bid={topPlayer ? bids[topPlayer.id] : undefined}
                    tricksWon={topPlayer ? tricksWon[topPlayer.id] || 0 : 0}
                    cards={
                        topPlayer
                            ? hands[
                                topPlayer.id
                                ]
                            : []
                    }
                    active={
                        currentPlayerId ===
                        topPlayer?.id
                    }
                />
            </div>

            <div className="absolute left-8 top-[42%] -translate-y-1/2">
                <PlayerSeat
                    position="left"
                    player={leftPlayer}
                    bid={leftPlayer ? bids[leftPlayer.id] : undefined}
                    tricksWon={leftPlayer ? tricksWon[leftPlayer.id] || 0 : 0}
                    cards={
                        leftPlayer
                            ? hands[
                                leftPlayer.id
                                ]
                            : []
                    }
                    active={
                        currentPlayerId ===
                        leftPlayer?.id
                    }
                />
            </div>

            <div className="absolute right-8 top-[42%] -translate-y-1/2">
                <PlayerSeat
                    position="right"
                    player={rightPlayer}
                    bid={rightPlayer ? bids[rightPlayer.id] : undefined}
                    tricksWon={rightPlayer ? tricksWon[rightPlayer.id] || 0 : 0}
                    cards={
                        rightPlayer
                            ? hands[
                                rightPlayer.id
                                ]
                            : []
                    }
                    active={
                        currentPlayerId ===
                        rightPlayer?.id
                    }
                />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pt-36">

                <Table
                    tableCards={tableCards}
                    players={players}
                    playersFromView={[
                        me,
                        leftPlayer,
                        topPlayer,
                        rightPlayer,
                    ].filter(Boolean) as Player[]}
                    isResolvingTrick={isResolvingTrick}
                    lastTrickWinnerId={lastTrickWinnerId}
                    trumpCard={trumpCard}
                />

            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full">

                <div className="text-center mb-4 text-xl font-bold text-white drop-shadow">
                    {me?.name}
                </div>

                <Hand
                    hand={hand}
                    isMyTurn={isMyTurn}
                    phase={phase}
                    isResolvingTrick={
                        isResolvingTrick
                    }
                    playCard={playCard}
                />

            </div>

        </div>
    );
}