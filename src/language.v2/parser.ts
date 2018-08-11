import { StringSource } from '../structures/source';
import { Cursor } from '../structures/cursor';
import { BBString, BBSubTag, BBNamedArg, BBStructure } from './structure';
import { Range, Location } from '../structures/selection';
import { Enumerable } from '../structures/enumerable';

function trimParts(parts: Array<string | BBSubTag>) {
    let part = parts[0];
    if (typeof part === 'string') {
        parts[0] = part.replace(/^\s+/, '');
        if (!parts[0]) // Dont want empty elements in the resulting BBString
            parts.shift();
    }

    part = parts[parts.length - 1];
    if (typeof part === 'string') {
        parts[parts.length - 1] = part.replace(/\s+$/, '');
        if (!parts[parts.length - 1]) // Dont want empty elements in the resulting BBString
            parts.pop();
    }
}

function* joinNeighbouringStrings(this: Enumerable<string | BBSubTag>) {
    let text = []; // To keep track of any chain of strings
    for (const value of this) {
        if (typeof value === 'string') {
            text.push(value); // Add to the string chain
        } else {
            if (text.length > 0) {
                // Any string chain must be joined, yielded and reset before yielding the current non-string part
                yield text.join(';');
                text = [];
            }
            yield value;
        }
    }
    if (text.length > 0)
        // Ensure that no text is left over at the end
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

    // BBSubTags contains text up to and including a '}'
    while ((moved = cursor.moveNext()) && cursor.prev !== '}') {
        // Until the next block is parsed we cant really know what kind of value the result will be.
        // Perform a generic parse and then change the action based on the value
        let arg = parseSubtagArg(source, cursor);
        if ('length' in arg) {
            // NamedArgs are the only structure that can be multiple in 1 argument
            named.push(...arg);
        } else {
            if (named.length > 0)
                // Once a named arg has been found, only named args may follow it
                throw new ParseError(arg.range.start, 'Named args cannot be followed by positional args');
            args.push(arg);
        }
    }

    if (!moved)
        // We hit the end of the text before finding a closing '}'
        throw new ParseError(start, 'Unpaired \'{\'');

    let end = cursor.location;

    return new BBSubTag(source, new Range(start, end), args, named);
}

function parseSubtagArg(source: StringSource, cursor: Cursor): BBString | BBSubTag | BBNamedArg[] {
    // Parse as a BBString initially
    // BBSubTags can be extracted from a BBString
    // BBNamedArgs are created from BBSubTags
    let parsed = parseBBString(source, cursor);

    // Variables to keep track of what kinds of values we have seen so far in the BBString.parts
    let hasText = false, hasNamed = false, subtags: BBSubTag[] = [];
    for (const part of parsed.parts) {
        if (typeof part === 'string') {
            if (part.trim())
                // Blank strings dont count as text for these purposes    
                hasText = true;
        } else {
            if (part.name.content.startsWith('*')) {
                // Subtag is styled like a BBNamedArg. Check it is valid
                if (!part.args.named.isEmpty())
                    throw new ParseError(part.args.named.first()!.range.start, 'Named args cannot contain named args');
                hasNamed = true;
            } else {
                subtags.push(part);
            }
        }

        if (hasNamed && hasText) throw new ParseError(parsed.range.start, 'Cannot mix named args and text');
        if (hasNamed && subtags.length > 0) throw new ParseError(parsed.range.start, 'Cannot mix named args and subtags');
    }

    if (hasNamed)
        return parsed.parts.cast<BBSubTag>().map(
            part => new BBNamedArg(source, part.range, part.args.positional.prepend(part.name))
        ).toArray();

    if (hasText || subtags.length !== 1)
        // If there is non-blank text or multiple subtags then during execution they will be converted to strings and
        // joined together, losing their references. Because no optimisations can be made, just return the BBString as is
        return parsed;

    // The subtag arg consisted of exactly 1 part which was not an empty string.
    // This must be a BBSubTag, which means references can be preserved up the call stack.
    return subtags[0];
}

export class ParseError extends Error {
    public readonly location: Location;
    constructor(location: Location, message: string) {
        super(`[${location.line + 1}:${location.column + 1}] ${message}`);
        this.location = location;
    }
}