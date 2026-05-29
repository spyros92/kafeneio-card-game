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

type OpponentsProps = {
    opponents: Player[];
    hands: Record<string, Card[]>;
    currentPlayerId?: string;
};

export function Opponents({
                              opponents,
                              hands,
                              currentPlayerId,
                          }: OpponentsProps) {
    return (
        <>
            <h3 className="text-xl mt-8 mb-4">
                Opponents
            </h3>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
                {opponents.map((player) => (
                    <div
                        key={player.id}
                        className={`p-3 rounded-xl bg-green-800 min-w-28 sm:min-w-40 text-center ${
                            currentPlayerId === player.id
                                ? "ring-4 ring-yellow-400"
                                : ""
                        }`}
                    >
                        <div className="font-bold mb-2">
                            {player.name}
                            {player.isBot ? " 🤖" : ""}
                            {!player.connected ? " 🔴" : ""}
                        </div>

                        <div className="flex justify-center gap-1">
                            {(hands[player.id] || []).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-12 rounded border border-white bg-red-900"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}