type Player = {
    id: string;
    name: string;
};

type BiddingPanelProps = {
    bid: string;
    setBid: (value: string) => void;
    placeBid: () => void;
    round: number;
    players: Player[];
    bids: Record<string, number>;
};

export function BiddingPanel({
                                 bid,
                                 setBid,
                                 placeBid,
                                 round,
                                 players,
                                 bids,
                             }: BiddingPanelProps) {
    const bidOptions = Array.from(
        { length: round + 1 },
        (_, index) => index
    );

    const playersAlreadyBid = Object.keys(bids).length;
    const isLastBidder = playersAlreadyBid === players.length - 1;
    const totalPreviousBids = Object.values(bids).reduce((sum, value) => sum + value, 0);

    return (
        <div className="bg-black/50 border border-yellow-400/30 rounded-xl p-3 shadow-xl backdrop-blur-md max-w-xs">
            <h3 className="text-xl font-bold mb-3 text-yellow-300">
                Prediction
            </h3>

            <div className="grid grid-cols-6 gap-1.5 mb-3">
                {bidOptions.map((option) => {
                    const disabled = isLastBidder && totalPreviousBids + option === round;
                    const selected = bid === String(option);

                    return (
                        <button
                            key={option}
                            disabled={disabled}
                            onClick={() => setBid(String(option))}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                                selected
                                    ? "bg-yellow-400 text-black scale-110"
                                    : "bg-white/15 text-white hover:bg-white/30"
                            } ${
                                disabled
                                    ? "opacity-30 cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="text-sm text-white/80 mb-4">
                Σύνολο bids: {totalPreviousBids}
                {isLastBidder ? ` / δεν μπορεί να γίνει ${round}` : ""}
            </div>

            <button
                onClick={placeBid}
                disabled={!bid}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-6 py-2 rounded-xl"
            >
                Submit Bid
            </button>
        </div>
    );
}