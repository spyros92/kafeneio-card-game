type Player = {
    id: string;
    name: string;
};

type ScoreBoardProps = {
    players: Player[];
    scores: Record<string, number>;
    tricksWon: Record<string, number>;
    bids: Record<string, number>;
};

export function ScoreBoard({
                               players,
                               scores,
                               tricksWon,
                               bids,
                           }: ScoreBoardProps) {
    return (
        <div className="mt-8 w-full max-w-xl">

            <h3 className="text-2xl font-bold mb-4">
                Score Board
            </h3>

            <div className="space-y-3">

                {players.map((player) => (

                    <div
                        key={player.id}
                        className="bg-green-800 rounded-xl px-4 py-3 flex justify-between items-center"
                    >

                        <div className="font-bold">
                            {player.name}
                        </div>

                        <div className="flex gap-6 text-sm">

                            <div>
                                Bid:{" "}
                                <span className="font-bold">
                                    {
                                        bids[player.id] ??
                                        "-"
                                    }
                                </span>
                            </div>

                            <div>
                                Tricks:{" "}
                                <span className="font-bold">
                                    {
                                        tricksWon[player.id] ||
                                        0
                                    }
                                </span>
                            </div>

                            <div>
                                Score:{" "}
                                <span className="font-bold text-yellow-300">
                                    {
                                        scores[player.id] ||
                                        0
                                    }
                                </span>
                            </div>

                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}