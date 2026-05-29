type MyPredictionHudProps = {
    bid?: number;
    tricksWon?: number;
};

export function MyPredictionHud({
                                    bid,
                                    tricksWon = 0,
                                }: MyPredictionHudProps) {
    if (bid === undefined) {
        return null;
    }

    return (
        <div className="absolute bottom-4 left-4 z-50 bg-black/55 border border-yellow-400/30 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl">
            <div className="text-xs text-white/70 uppercase tracking-widest mb-2">
                My Prediction
            </div>

            <div className="flex gap-1">
                {Array.from({ length: Math.max(bid, tricksWon) }).map((_, index) => {

                    const isCorrect =
                        index < bid &&
                        index < tricksWon;

                    const isExtra =
                        index >= bid &&
                        index < tricksWon;

                    return (
                        <div
                            key={index}
                            className={`w-4 h-4 rounded-full border border-white/50 ${
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
        </div>
    );
}