import { Range, Location } from './structures/selection';
import { Cursor } from './structures/cursor';

export class BBString {
    public static parse(parent: BBSubTag | BBSource, cursor: Cursor): BBString {
        let result = new BBString(parent);
        let start = cursor.location;
        let current = cursor.location;

        do {
            if (cursor.next == '}') {
                if (result.parent === null)
                    throw new ParseError(cursor.location, 'Unexpected \'}\'');
                break;
            } else if (cursor.next == '}') {
                break;
            } else if (parent instanceof BBSubTag && cursor.next == '=' && parent.name === undefined) {
                break;
            } else if (cursor.next == ';' && result.parent !== null) {
                break;
            } else if (cursor.next == '{') {
                if (!Location.AreEqual(current, cursor.location))
                    result._parts.push(getContent(result.source.lines, new Range(current, cursor.location)));
                result._parts.push(BBSubTag.parse(result, cursor));
                current = cursor.location;
                cursor.moveBack();
            }
        } while (cursor.moveNext());


        if (!Location.AreEqual(current, cursor.location) || Location.AreEqual(start, cursor.location))
            result._parts.push(getContent(result.source.lines, new Range(current, cursor.location)));
        result._range = new Range(start, cursor.location);
        result._content = getContent(result.source.lines, result._range);

        return result;
    }

    public readonly parent: BBSubTag | null;
    public readonly source: BBSource;
    private _content: string = '';
    private _range: Range | null = null;
    private _parts: BBPart[] = [];

    public get content(): string { return this._content; }
    public get range(): Range { return this._range as Range; }
    public get parts(): BBPart[] { return this._parts.slice(0); }

    private constructor(parent: BBSubTag | BBSource) {
        if (parent instanceof BBSubTag) {
            this.parent = parent;
            this.source = this.parent.source;
        } else {
            this.parent = null;
            this.source = parent;
        }
    }
}

export class BBSubTag {
    public static parse(parent: BBString, cursor: Cursor): BBSubTag {
        let result = new BBSubTag(parent);

        let start = cursor.location;

        while (cursor.moveNext()) {
            result._parts.push(BBString.parse(result, cursor));
            if (cursor.next === '}')
                break;
            if (cursor.next === '=') {
                result._named = true;
                continue;
            }
            if (cursor.next !== ';' && cursor.next !== undefined)
                cursor.moveBack();
        }

        if (cursor.next != '}')
            throw new ParseError(start, 'Unpaired \'{\'');

        // Named arguments
        if (result.name && result.named) {
            if (result.args.length > 1)
                throw new ParseError(start, 'Cannot use \';\' when using named arguments');

        }

        // Key-value pairs
        if (result.name && result.name.content.startsWith('*')) {
            result._keyValue = true;
            if (result.args.length !== 1)
                throw new ParseError(start, 'Key-Values must have exactly 1 argument');
        }

        cursor.moveNext();

        result._range = new Range(start, cursor.location);
        result._content = getContent(result.source.lines, result._range);

        return result;
    }

    public readonly parent: BBString;
    public readonly source: BBSource;
    private _content: string = '';
    private _range: Range | null = null;
    private _parts: BBString[] = [];
    private _named: boolean = false;
    private _keyValue: boolean = false;
    private _kvParsed: { key: string | null, value: string | null } = {
        key: null,
        value: null
    };

    public resolvedName: string = '';
    public get content(): string { return this._content; }
    public get range(): Range { return this._range as Range; }

    public get name(): BBString | undefined { return this._parts[0]; }
    public get args(): BBString[] { return this._parts.slice(1); }
    public get named(): boolean { return this._named; }
    public get keyValue(): boolean { return this._keyValue; }
    public get key(): string | null { return this._kvParsed.key; }
    public get value(): string | null { return this._kvParsed.value; }
    public set key(value: string | null) { this._kvParsed.key = value; }
    public set value(value: string | null) { this._kvParsed.value = value; }

    private constructor(parent: BBString) {
        this.parent = parent;
        this.source = this.parent.source;
    }
}

export class BBSource {
    public readonly raw: string;
    public readonly lines: string[];
    public readonly range: Range;

    constructor(raw: string) {
        this.raw = raw;
        let lines = this.lines = this.raw.split('\n');
        for (let i = 0; i < lines.length - 1; i++)
            lines[i] = lines[i] + '\n';
        let start = new Location(0, 0);
        let end = new Location(lines.length, lines[lines.length - 1].length);
        this.range = new Range(start, end);
    }
}

export type BBPart = (BBSubTag | string);

export class ParseError extends Error {
    public readonly location: Location;
    constructor(location: Location, message: string) {
        super(`[${location.line + 1}:${location.column + 1}]: ${message}`);
        this.location = location;
    }
}

export function getContent(lines: string[], range: Range): string {
    lines = lines.slice(range.start.line, range.end.line + 1);
    lines[lines.length - 1] = lines[lines.length - 1].substr(0, range.end.column);
    lines[0] = lines[0].substr(range.start.column);
    return lines.join('').trim();
}

export function parse(text: string) {
    let source = new BBSource(text);
    let cursor = new Cursor(source.raw);
    return BBString.parse(source, cursor);
}