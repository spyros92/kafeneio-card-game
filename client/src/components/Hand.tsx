import { CardView } from "./CardView";

type Card = {
    suit: string;
    value: number;
};

type HandProps = {
    hand: Card[];
    isMyTurn: boolean;
    phase: string;
    isResolvingTrick: boolean;
    playCard: (card: Card) => void;
};

export function Hand({
                         hand,
                         isMyTurn,
                         phase,
                         isResolvingTrick,
                         playCard,
                     }: HandProps) {
    const canPlay = isMyTurn && phase === "playing" && !isResolvingTrick;

    return (
        <div className="flex justify-center gap-0 mt-6 flex-nowrap">
            {hand.map((card, index) => {
                const middle = (hand.length - 1) / 2 ;
                const offset = index - middle;
                const rotate = offset * 5;
                const translateY = Math.abs(offset) * 1;

                return (
                    <button
                        key={`${card.suit}-${card.value}`}
                        disabled={!canPlay}
                        onClick={() => playCard(card)}
                        style={{
                            transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
                            marginLeft: index === 0 ? "0px" : "-80px",
                        }}
                        className={`group w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 bg-transparent rounded-xl shadow-2xl mb-4 transition-transform duration-300 ease-out active:scale-95 flex items-center justify-center overflow-visible ${
                            canPlay ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                    >
                        <div className="w-full h-full transition-transform duration-300 ease-out group-hover:-translate-y-6 group-hover:scale-105">
                            <CardView card={card} />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}