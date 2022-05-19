export const toCents = (num: number):number => {   
    const twoPlaces = Math.round((Number(num) + Number.EPSILON) * 100) / 100
    const cents = Number(twoPlaces) * 100
    return cents
};
export const fromCents = (num: number):number => {
    const cents = num / 100
    const factor = 10 ** 2;
    const decimal = Math.round(cents * factor) / factor;
    return decimal
};