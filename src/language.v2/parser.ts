import { StringSource } from '../structures/source';
import { Cursor } from '../structures/cursor';
import { BBString, BBSubTag, BBNamedArg, BBStructure } from './structure';
import { Range, Location } from '../structures/selection';
import { Enumerable } from '../structures/enumerable';

export function parse(content: string) {
    let source = new StringSource(content);
    let cursor = new Cursor(content);
    let results: BBString[] = [];

    do {
        results.push(parseBBString(source, cursor));
    } while (cursor.moveNext());

    return new BBString(
        source,
        source.range,
        Enumerable.from(results)
            .mapMany(v => v.parts)
            .generate(function* () {
                let iterator = this[Symbol.iterator]();
                let result = iterator.next();
                while (!result.done) {
                    let text = [];
                    while (!result.done && typeof result.value === 'string') {
                        text.push(result.value);
                        result = iterator.next();
                    }
                    if (text.length > 0)
                        yield text.join(';');
                    if (!result.done)
                        yield result.value;
                }
            })
    );
}



function parseBBString(source: StringSource, cursor: Cursor): BBString {
    let parts: Array<string | BBSubTag> = [];
    let start, marker = start = cursor.location;

    while (cursor.next !== ';' && cursor.next !== '}') {
        if (cursor.next === '{') {
            let text = source.get(new Range(marker, cursor.location));
            if (text) parts.push(text);
            console.log(cursor.location, 'Begin read subtag');
            parts.push(parseBBSubTag(source, cursor));
            console.log(cursor.location, 'Resule read bbstring');
            // cursor.prev === '}'
            marker = cursor.location;
        } else if (!cursor.moveNext()) {
            break;
        }
    }

    let end = cursor.location;
    let text = source.get(new Range(marker, end));
    if (text) parts.push(text);

    return new BBString(source, new Range(start, end), parts);
}

function parseBBSubTag(source: StringSource, cursor: Cursor): BBSubTag {
    let args: Array<BBString | BBSubTag> = [];
    let named: Array<BBNamedArg> = [];
    let moved = false;
    let start = cursor.location;

    while ((moved = cursor.moveNext()) && cursor.prev !== '}') {
        let arg = parseSubtagArg(source, cursor);
        if ('length' in arg) {
            named = arg;
        } else {
            if (named.length > 0) {
                throw new ParseError(arg.range.start, 'Named args cannot be followed by positional args');
            }
            args.push(arg);
        }
    }

    if (!moved) throw new ParseError(start, 'Unpaired \'{\'');

    let end = cursor.location;

    return new BBSubTag(source, new Range(start, end), args, named);
}

function parseSubtagArg(source: StringSource, cursor: Cursor): BBString | BBSubTag | BBNamedArg[] {
    let parsed = parseBBString(source, cursor);
    let hasText = false, hasNamed = false, hasSubtag = false;
    for (const part of parsed.parts) {
        if (typeof part === 'string') {
            if (part.trim()) {
                hasText = true;
            }
        } else {
            if (part.content.startsWith('*')) {
                if (part.args.named.any(_ => true)) {
                    throw new ParseError(part.args.named.first()!.range.start, 'Named args cannot contain named args');
                }
                hasNamed = true;
            } else {
                hasSubtag = true;
            }
        }

        if (hasNamed && hasText) throw new ParseError(parsed.range.start, 'Cannot mix named args and text');
        if (hasNamed && hasSubtag) throw new ParseError(parsed.range.start, 'Cannot mix named args and subtags');
    }

    if (hasNamed)
        return parsed.parts.map(
            part => new BBNamedArg(
                source,
                (<BBSubTag>part).range,
                (<BBSubTag>part).args.positional
            )
        ).toArray();

    if (hasText || !hasSubtag || parsed.parts.count() !== 1)
        return parsed;

    return <any>parsed.parts.first();
}

export class ParseError extends Error {
    public readonly location: Location;
    constructor(location: Location, message: string) {
        super(`[${location.line + 1}:${location.column + 1}]: ${message}`);
        this.location = location;
    }
}