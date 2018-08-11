import { StringSource } from '../structures/source';
import { Cursor } from '../structures/cursor';
import { BBString, BBSubTag, BBNamedArg, BBStructure } from './structure';
import { Range, Location } from '../structures/selection';
import { Enumerable } from '../structures/enumerable';

function trimParts(parts: Array<string | BBSubTag>) {
    let part = parts[0];
    if (typeof part === 'string') {
        parts[0] = part.replace(/^\s+/, '');
        if (!parts[0])
            parts.shift();
    }

    part = parts[parts.length - 1];
    if (typeof part === 'string') {
        parts[parts.length - 1] = part.replace(/\s+$/, '');
        if (!parts[parts.length - 1])
            parts.pop();
    }
}

function* joinNeighbouringStrings(this: Enumerable<string | BBSubTag>) {
    let text = [];
    for (const value of this) {
        if (typeof value === 'string') {
            text.push(value);
        } else {
            if (text.length > 0) {
                yield text.join(';');
                text = [];
            }
            yield value;
        }
    }
    if (text.length > 0)
        yield text.join(';');
}

export function parse(content: string) {
    let source = new StringSource(content);
    let cursor = new Cursor(content);
    let results: BBString[] = [];

    // parseBBString stops when cursor.next == ';' or '}'
    // At the top level (here) we want to keep parsing after any ';' that are not inside a subtag.

    do {
        results.push(parseBBString(source, cursor, true));

        if (cursor.next === '}')
            // A '}' at the top level means that there is an unpaired '}'
            throw new ParseError(cursor.location, 'Unpaired \'}\'');
    } while (cursor.moveNext());

    let parts = Enumerable.from(results).mapMany(bb => bb.parts);
    if (results.length > 1)
        // If there are multiple BBStrings (i.e. there were top level ';'s present) then we need to
        // join together any neighbouring strings using ';' as the separator.
        // e.g. ['hi!', ' this is ', 'a test'] => ['hi!; this is ;a test']
        parts = parts.generate(joinNeighbouringStrings);


    // Now that we have our joined up bbstring parts, we can trim the start and end, then create a new bbstring instance
    let asArray = parts.toArray();
    trimParts(asArray);

    return new BBString(source, source.range, asArray);
}

function parseBBString(source: StringSource, cursor: Cursor, dontTrim?: boolean): BBString {
    let parts: Array<string | BBSubTag> = [];
    let start, marker = start = cursor.location;

    // BBStrings contain text up until a ';' or '}'
    while (cursor.next !== ';' && cursor.next !== '}') {
        if (cursor.next === '{') {
            // Push the text since the marker onto the parts array, then begin subtag parsing.
            // Once subtag parsing is done, reset the marker
            let text = source.get(new Range(marker, cursor.location));
            if (text) parts.push(text);
            parts.push(parseBBSubTag(source, cursor));
            marker = cursor.location;
        } else if (!cursor.moveNext()) {
            break;
        }
    }

    // Push any remaining text onto the parts array
    let end = cursor.location;
    let text = source.get(new Range(marker, end));
    if (text) parts.push(text);

    if (!dontTrim) trimParts(parts);

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
        super(`[${location.line + 1}:${location.column + 1}] ${message}`);
        this.location = location;
    }
}