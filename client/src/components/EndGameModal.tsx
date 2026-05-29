type Player = {
    id: string;
    name: string;
};

type EndGameModalProps = {
    players: Player[];
    scores: Record<string, number>;
};

export function EndGameModal({
                                 players,
                                 scores,
                             }: EndGameModalProps) {
    const sortedPlayers = [...players].sort(
        (a, b) =>
            (scores[b.id] || 0) -
            (scores[a.id] || 0)
    );

    const winner = sortedPlayers[0];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-green-900 border border-yellow-400 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
                <h2 className="text-4xl font-bold text-yellow-300 mb-4">
                    Τέλος Παιχνιδιού
                </h2>

                <div className="text-2xl font-bold mb-6">
                    Νικητής: {winner?.name}
                </div>

                <div className="space-y-3">
                    {sortedPlayers.map((player, index) => (
                        <div
                            key={player.id}
                            className="flex justify-between bg-green-800 rounded-xl px-4 py-3"
                        >
                            <span>
                                #{index + 1} {player.name}
                            </span>

                            <span className="font-bold text-yellow-300">
                                {scores[player.id] || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}