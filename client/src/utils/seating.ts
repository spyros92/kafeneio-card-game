type Player = {
    id: string;
    name: string;
    connected: boolean;
    isBot: boolean;
};

export function getPlayersFromMyView(
    players: Player[],
    myId: string | undefined
) {
    const myIndex = players.findIndex(
        (player) => player.id === myId
    );

    if (myIndex === -1) {
        return [];
    }

    return [
        ...players.slice(myIndex),
        ...players.slice(0, myIndex),
    ];
}