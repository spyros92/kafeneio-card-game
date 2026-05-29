import { useState } from "react";

type Player = {
    id: string;
    name: string;
};

type RoundHistoryItem = {
    round: number;
    playerId: string;
    bid: number;
    tricksWon: number;
    roundScore: number;
    totalScore: number;
};

type ScoreHudProps = {
    players: Player[];
    roundHistory: RoundHistoryItem[];
};

export function ScoreHud({
                             players,
                             roundHistory,
                         }: ScoreHudProps) {
    const [open, setOpen] = useState(false);

    const rounds = Array.from(
        new Set(roundHistory.map((item) => item.round))
    );

    return (
        <div className="absolute top-4 left-4 z-50">
            <button
                onClick={() => setOpen(!open)}
                className="bg-black/55 border border-yellow-400/30 backdrop-blur-md rounded-xl px-4 py-3 text-yellow-300 font-bold shadow-xl"
            >
                ☰ Score
            </button>

            {open && (
                <div className="mt-3 bg-black/70 border border-yellow-400/30 backdrop-blur-md rounded-2xl p-4 max-w-[90vw] max-h-[70vh] overflow-auto shadow-2xl">
                    <table className="text-sm text-white border-collapse">
                        <thead>
                        <tr className="text-yellow-300 border-b border-white/20">
                            <th className="px-3 py-2 text-left">Παίκτης</th>

                            {rounds.map((round) => (
                                <th
                                    key={round}
                                    className="px-3 py-2 text-center whitespace-nowrap"
                                >
                                    Γύρος {round}
                                </th>
                            ))}

                            <th className="px-3 py-2 text-center">
                                Σύνολο
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {players.map((player) => {
                            const playerHistory =
                                roundHistory.filter(
                                    (item) =>
                                        item.playerId === player.id
                                );

                            const total =
                                playerHistory.at(-1)?.totalScore || 0;

                            return (
                                <tr
                                    key={player.id}
                                    className="border-b border-white/10"
                                >
                                    <td className="px-3 py-2 font-bold whitespace-nowrap">
                                        {player.name}
                                    </td>

                                    {rounds.map((round) => {
                                        const item =
                                            playerHistory.find(
                                                (historyItem) =>
                                                    historyItem.round === round
                                            );

                                        return (
                                            <td
                                                key={round}
                                                className="px-3 py-2 text-center whitespace-nowrap"
                                            >
                                                {item ? (
                                                    <div>
                                                        <div>
                                                            P: {item.bid}
                                                        </div>
                                                        <div>
                                                            T: {item.tricksWon}
                                                        </div>
                                                        <div className="text-yellow-300 font-bold">
                                                            {item.roundScore > 0
                                                                ? `+${item.roundScore}`
                                                                : item.roundScore}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td className="px-3 py-2 text-center text-yellow-300 font-bold">
                                        {total}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}