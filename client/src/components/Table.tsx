import { motion } from "framer-motion";
import { CardView } from "./CardView";

type Card = {
    suit: string;
    value: number;
};

type TableCard = {
    playerId: string;
    card: Card;
};

type Player = {
    id: string;
    name: string;
};

type TableProps = {
    tableCards: TableCard[];
    players: Player[];
    playersFromView?: Player[];
    isResolvingTrick: boolean;
    lastTrickWinnerId: string | null;
    trumpCard: Card | null;
};

function getCardInitialPosition(
    playerId: string,
    playersFromView?: Player[]
) {
    const index =
        playersFromView?.findIndex(
            (player) =>
                player.id === playerId
        );

    if (index === 0) {
        return {
            x: -40,
            y: 80,
            rotate: -8,
        };
    }

    if (index === 1) {
        return {
            x: -120,
            y: 0,
            rotate: -18,
        };
    }

    if (index === 2) {
        return {
            x: -40,
            y: -80,
            rotate: 8,
        };
    }

    if (index === 3) {
        return {
            x: 40,
            y: 0,
            rotate: 18,
        };
    }

    return {
        x: 0,
        y: -100,
    };
}

function getTableCardPosition(
    playerId: string,
    playersFromView?: Player[],
    cardIndex?: number
) {

    const index =
        playersFromView?.findIndex(
            (player) =>
                player.id === playerId
        );
    if (cardIndex === 0) {
        return {
            x: -250,
            y: -40,
            rotate: -12,
        };
    }

    if (index === 0) return { x: -125, y: 15, rotate: -6 };
    if (index === 1) return { x: -165, y: -5, rotate: -12 };
    if (index === 2) return { x: -125, y: -65, rotate: 8 };
    if (index === 3) return { x: -75, y: -15, rotate: 14 };

    return {
        x: 0,
        y: 0,
        rotate: 0,
    };
}

export function Table({
                          tableCards,
                          players,
                          playersFromView,
                          isResolvingTrick,
                          lastTrickWinnerId,
                          trumpCard,
                      }: TableProps) {

    const winnerName =
        players.find(
            (p) =>
                p.id ===
                lastTrickWinnerId
        )?.name;

    return (
        <div className="relative flex flex-col items-center justify-center">

            {isResolvingTrick &&
                winnerName && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.8,
                            y: -20,
                        }}

                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}

                        className="absolute -top-20 z-50 bg-yellow-400 text-black px-6 py-3 rounded-2xl text-xl font-bold shadow-2xl"
                    >
                        🃏 Μπάζα πήρε ο {winnerName}
                    </motion.div>
                )}

            <div
                className="
                relative
                w-[520px]
                h-[320px]
                rounded-full
                bg-black/15
                border
                border-white/10
                backdrop-blur-sm
                shadow-inner
                "
            >
                {trumpCard && (
                    <div className="absolute left-[74%] top-[48%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div className="relative w-20 h-32 rotate-[-12deg] drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">

                            <CardView card={trumpCard} />

                            <div
                                className="
                                            absolute
                                            -top-5
                                            left-1/2
                                            -translate-x-1/2
                                            px-2
                                            py-[2px]
                                            rounded-full
                                            bg-black/65
                                            border
                                            border-yellow-300/40
                                            text-[10px]
                                            tracking-[0.25em]
                                            text-yellow-200
                                            font-bold
                                            backdrop-blur-sm"
                            >
                                ΑΤΟΥ
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className="
                                absolute
                                left-[85%]
                                top-[35%]
                                -translate-x-1/2
                                -translate-y-1/2
                                w-56
                                h-80
                                bg-contain
                                bg-no-repeat
                                bg-center
                                opacity-100 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]
                                z-30
                                pointer-events-none
                                "
                    style={{
                        backgroundImage: "url('/deck.png')",
                    }}
                />
                {tableCards.map(
                    (tableCard, index) => (

                        <motion.div
                            key={`${tableCard.playerId}-${index}`}

                            initial={{
                                scale: 0.15,
                                opacity: 0,
                                ...getCardInitialPosition(
                                    tableCard.playerId,
                                    playersFromView
                                ),
                            }}

                            animate={{
                                scale: 1,
                                opacity: 1,
                                ...getTableCardPosition(
                                    tableCard.playerId,
                                    playersFromView,
                                    index
                                ),
                            }}

                            transition={{
                                duration: 0.35,
                                type: "spring",
                                stiffness: 180,
                            }}

                            className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            "
                        >

                            <div
                                className={`bg-transparent rounded-lg overflow-hidden flex items-center justify-center relative transition-all duration-300 ${
                                    index === 0
                                        ? "w-20 h-28 sm:w-22 sm:h-32 md:w-24 md:h-36 brightness-110 saturate-125 drop-shadow-[0_0_16px_rgba(255,215,0,0.45)] z-20"
                                        : "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 opacity-95 z-10"
                                }`}
                            >

                                <CardView card={tableCard.card} />

                            </div>

                        </motion.div>
                    )
                )}

            </div>

        </div>
    );
}