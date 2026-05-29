type TimerHudProps = {
    timeLeft: number;
    phase: string;
};

export function TimerHud({
                             timeLeft,
                             phase,
                         }: TimerHudProps) {
    if (phase === "finished" || phase === "waiting") {
        return null;
    }

    return (
        <div className="absolute top-4 right-4 z-50 bg-black/55 border border-yellow-400/30 backdrop-blur-md rounded-xl px-5 py-3 shadow-xl">
            <div className="text-xs text-white/70 uppercase tracking-widest">
                {phase === "bidding" ? "Prediction" : "Turn"}
            </div>

            <div className="text-3xl font-bold text-yellow-300">
                {timeLeft}s
            </div>
        </div>
    );
}