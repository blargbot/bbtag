import { parse, BBArray, BBString } from '../language';

export type BBJArray = {
    v: string[],
    n?: string
};

function tryParse(text: string): any {
    try {
        return JSON.parse(text);
    } catch (_) {
    }
}

function tryFullParse(text: string): any {
    try {
        return parse(text);
    } catch (_) {
    }
}

function stringify(value: any): string {
    if (typeof value === 'string')
        return value;
    return JSON.stringify(value);
}

function spread(text: string): string {
    return text.replace(/(\[|,)\s*(\d+)\s*\.\.\.?\s*(\d+)\s*(\]|,)/g,
        function (match, open, start, end, close) {
            let [from, to] = [parseInt(start), parseInt(end)];
            let descending = from > to;
            let count = Math.abs(from - to) + 1;
            let offset = Math.min(from, to);
            if (count > 1000)
                return match;
            let values = [...Array(count).keys()].map(v => offset + v);
            if (descending)
                values = values.reverse();
            return open + values.join(', ') + close;
        });
}

export function serialize(array: BBJArray | string[] | BBArray, name?: string): string {
    if (array instanceof BBArray)

        if (Array.isArray(array)) {
            array = { v: array };
        }

    if (name != undefined) {
        array.n = name;
    }

    if (!array.n) {
        return JSON.stringify(array.v);
    }

    return JSON.stringify({ v: array.v, n: array.n });
}

export function deserialize(text: string): BBArray | undefined {
    let parsed = tryParse(text) || tryParse(spread(text));

    if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed))
            parsed = { v: parsed.map(stringify) }
        else if (!Array.isArray(parsed.v) ||
            ['string', 'undefined', 'null'].indexOf(typeof parsed.n) == -1)
            parsed = undefined;
        else if (parsed.n)
            parsed = { v: parsed.v.map(stringify), n: parsed.n };
        parsed = { v: parsed.v.map(stringify) };
    }
    if (parsed) {

    } else {
        let fullParsed: BBString = tryFullParse(text);
        fullParsed.
    }
}