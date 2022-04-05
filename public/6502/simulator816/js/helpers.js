export function randomUInt8() {
    return Math.floor(Math.random() * 256);//Safe to use max of 256 because math.rand will never give 1
}

export function randomUInt16() {
    return Math.floor(Math.random() * 65536);
}

export function randomBit() {
    return Math.round(Math.random());
}