type Player = {
    id: string;
    name: string;
    connected: boolean;
    isBot: boolean;
};

type PlayersListProps = {
    players: Player[];
};

export function PlayersList({
                                players,
                            }: PlayersListProps) {
    return (
        <div className="mt-6">

            <h3 className="text-2xl font-bold mb-4">
                Players
            </h3>

            <ul className="flex gap-4 flex-wrap justify-center">

                {players.map((player) => (

                    <li
                        key={player.id}

                        className={`px-4 py-2 rounded-xl font-bold ${
                            player.connected
                                ? "bg-green-700"
                                : "bg-red-700 opacity-60"
                        }`}
                    >
                        {player.name}

                        {player.isBot
                            ? " 🤖"
                            : ""}

                        {!player.connected
                            ? " 🔴"
                            : ""}
                    </li>
                ))}
            </ul>
        </div>
    );
}