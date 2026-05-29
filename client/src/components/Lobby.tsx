type LobbyProps = {
    name: string;
    setName: (value: string) => void;
    roomId: string;
    setRoomId: (value: string) => void;
    createRoom: () => void;
    joinRoom: () => void;
    createSingleplayer: () => void;
};

export function Lobby({
                          name,
                          setName,
                          roomId,
                          setRoomId,
                          createRoom,
                          joinRoom,
                          createSingleplayer,
                      }: LobbyProps) {
    return (
        <div className="flex flex-col items-center gap-6 mt-10">

            <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-xl text-black w-72"
            />

            <div className="flex gap-4">
                {/*<button
                    onClick={createRoom}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl"
                >
                    Create Room
                </button>*/}

                <button
                    onClick={createSingleplayer}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl"
                >
                    Play Solo
                </button>
            </div>

            {/*<div className="flex gap-4">
                <input
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="px-4 py-3 rounded-xl text-black w-48"
                />

                <button
                    onClick={joinRoom}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl"
                >
                    Join Room
                </button>
            </div>*/}

        </div>
    );
}