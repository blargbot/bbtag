export function smartJoin(array: any[], separator: string, lastSeparator?: string) {
    if (lastSeparator === undefined)
        lastSeparator = separator;
    let blocked = [
        array.slice(0, -1),
        array.slice(-1)
    ];
    if (blocked[1].length === 0)
        return '';
    if (blocked[0].length === 0)
        return String(blocked[1][0]);
    return [blocked[0].join(separator), blocked[1][0]].join(lastSeparator);
}