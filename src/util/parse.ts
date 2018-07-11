export function parseBool(text: string): boolean | undefined {
    switch (text.toLowerCase()) {
        case 'true':
        case 'yes':
        case 'y':
        case 't':
            return true;
        case 'false':
        case 'no':
        case 'n':
        case 'f':
            return false;
    }

    if (/^[+-]?\d+$/.test(text)) {
        return parseInt(text) !== 0;
    }

    return undefined;
}