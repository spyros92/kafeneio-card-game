export function getCardImage(
    suit: string,
    value: number
) {
    const valueMap: Record<number, string> = {
        11: "jack",
        12: "queen",
        13: "king",
        14: "ace",
    };

    const cardValue =
        valueMap[value] ||
        value.toString();

    return `/cards/${cardValue}_of_${suit}.svg`;
}