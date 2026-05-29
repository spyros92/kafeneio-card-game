import { Card, Suit } from "./types";

const suits: Suit[] = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
];

export function createDeck(): Card[] {
    const deck: Card[] = [];

    for (const suit of suits) {
        for (let value = 2; value <= 14; value++) {
            deck.push({
                suit,
                value,
            });
        }
    }

    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(
            Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i],
        ];
    }

    return shuffled;
}

export function dealCards(
    deck: Card[],
    playerIds: string[],
    cardsPerPlayer: number
): Record<string, Card[]> {
    const hands: Record<string, Card[]> = {};

    for (const playerId of playerIds) {
        hands[playerId] = [];
    }

    for (let i = 0; i < cardsPerPlayer; i++) {
        for (const playerId of playerIds) {
            const card = deck.pop();

            if (card) {
                hands[playerId].push(card);
            }
        }
    }

    return hands;
}
export function determineTrickWinner(
    tableCards: {
        playerId: string;
        card: Card;
    }[],
    trumpSuit: string
) {
    let winningCard =
        tableCards[0];

    for (const tableCard of tableCards) {
        const current =
            tableCard.card;

        const winning =
            winningCard.card;

        const currentIsTrump =
            current.suit === trumpSuit;

        const winningIsTrump =
            winning.suit === trumpSuit;

        if (
            currentIsTrump &&
            !winningIsTrump
        ) {
            winningCard = tableCard;
            continue;
        }

        if (
            current.suit ===
            winning.suit &&
            current.value >
            winning.value
        ) {
            winningCard = tableCard;
        }
    }

    return winningCard.playerId;
}
export function calculateScore(
    bid: number,
    tricksWon: number
) {
    if (bid === tricksWon) {
        return 10 + bid;
    }

    return -Math.abs(
        bid - tricksWon
    );
}
export function mustFollowSuit(
    playerHand: Card[],
    leadSuit: string
) {
    return playerHand.some(
        (card) => card.suit === leadSuit
    );
}
export function getValidCards(
    hand: Card[],
    leadSuit?: string,
    trumpSuit?: string
) {

    if (!leadSuit) {
        return hand;
    }

    const matchingSuitCards =
        hand.filter(
            (card) =>
                card.suit === leadSuit
        );

    if (matchingSuitCards.length > 0) {
        return matchingSuitCards;
    }

    if (trumpSuit) {

        const trumpCards =
            hand.filter(
                (card) =>
                    card.suit === trumpSuit
            );

        if (trumpCards.length > 0) {
            return trumpCards;
        }
    }

    return hand;
}