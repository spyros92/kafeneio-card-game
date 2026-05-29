type Player = {
    id: string;
    name: string;
};

type GameHeaderProps = {
    roomId: string;
    phase: string;
    round: number;
    timeLeft: number;
    currentPlayer?: Player;
    isMyTurn: boolean;
    players: Player[];
    scores: Record<string, number>;
};

export function GameHeader({
                               roomId,
                               phase,
                               round,
                               timeLeft,
                               currentPlayer,
                               isMyTurn,
                               players,
                               scores,
                           }: GameHeaderProps) {

    const winner =
        [...players].sort(
            (a, b) =>
                (scores[b.id] || 0) -
                (scores[a.id] || 0)
        )[0];

    return (
        <div className="flex flex-col items-center gap-3 mb-8">

            <h2 className="text-3xl font-bold">
                Room: {roomId}
            </h2>

            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-lg">

                <div>
                    Phase:{" "}
                    <span className="font-bold">
                        {phase}
                    </span>
                </div>

                <div>
                    Round:{" "}
                    <span className="font-bold">
                        {round}
                    </span>
                </div>

                {phase !== "finished" && (
                    <div>
                        Timer:{" "}
                        <span className="font-bold text-yellow-300">
                            {timeLeft}s
                        </span>
                    </div>
                )}

            </div>

            {currentPlayer && (
                <div className="text-xl">

                    Turn:{" "}

                    <span className="font-bold text-yellow-300">
                        {currentPlayer.name}
                    </span>

                    {isMyTurn &&
                        " — είναι η σειρά σου"}
                </div>
            )}

            {phase === "finished" &&
                winner && (
                    <div className="text-4xl font-bold text-yellow-300 mt-4">
                        Νικητής: {winner.name}
                    </div>
                )}

        </div>
    );
}