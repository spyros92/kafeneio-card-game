export type Suit =
    | "hearts"
    | "diamonds"
    | "clubs"
    | "spades";

export type Card = {
    suit: Suit;
    value: number;
};

export type Player = {
    id: string;
    name: string;
    connected: boolean;
};

export type RoomPhase =
    | "waiting"
    | "bidding"
    | "playing"
    | "scoring"
    | "finished";

export type Room = {
    id: string;

    hostId: string;

    players: Player[];

    phase: RoomPhase;

    round: number;

    dealerIndex: number;

    currentTurnIndex: number;

    trumpCard: Card | null;

    hands: Record<string, Card[]>;

    bids: Record<string, number>;

    tricksWon: Record<string, number>;

    scores: Record<string, number>;

    roundHistory: {
        round: number;
        playerId: string;
        bid: number;
        tricksWon: number;
        roundScore: number;
        totalScore: number;
    }[];

    tableCards: {
        playerId: string;
        card: Card;
    }[];

    isResolvingTrick: boolean;

    lastTrickWinnerId: string | null;

    turnEndsAt: number | null;
};