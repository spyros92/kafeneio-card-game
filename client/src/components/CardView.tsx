import { getCardImage } from "../utils/getCardImage";

type Card = {
    suit: string;
    value: number;
};

type Props = {
    card: Card;
};

export function CardView({ card }: Props) {
    return (
        <img
            src={getCardImage(card.suit, card.value)}
            alt={`${card.value} of ${card.suit}`}
            className="w-full h-full object-fill rounded-lg pointer-events-none select-none"
            draggable={false}
        />
    );
}