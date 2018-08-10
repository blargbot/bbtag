import { Range, Location } from './structures/selection';
import { Cursor } from './structures/cursor';
import { Enumerable } from './structures/enumerable';

type BBSubtagArgs = {
    readonly all: Enumerable<BBString | BBSubTag | BBNamedArg>,
    readonly positional: Enumerable<BBString | BBSubTag>,
    readonly named: Enumerable<BBNamedArg>
};

function getName(part: BBString | BBSubTag): BBString {
    if ('parts' in part)
        return part;
    throw new InvalidName(part);
}

export abstract class BBStructure {
    public readonly source: BBSource;
    public readonly range: Range;
    constructor(source: BBSource, range: Range) {
        this.source = source;
        this.range = range;
    }
}

export class BBSource {
    public readonly content: string;
    private readonly lines: Enumerable<string>;

    constructor(content: string) {
        this.content = content;
        this.lines = new Enumerable(content.split('\n'));
    }

    public get(range: Range): string {
        let lines = this.lines.slice(range.start.line, range.end.line + 1).toArray();
        lines[lines.length - 1] = lines[lines.length - 1].substring(0, range.end.column);
        lines[0] = lines[0].substring(range.start.column);
        return lines.join('\n');
    }
}

export class BBString extends BBStructure {
    private readonly _parts: Array<string | BBSubTag> = [];
    public readonly parts = new Enumerable(this._parts);
}

export class BBSubTag extends BBStructure {
    private readonly _parts: Array<BBString | BBSubTag> = [];
    private readonly _named: Array<BBNamedArg> = [];

    public get name() { return getName(this._parts[0]); }
    public readonly args: BBSubtagArgs = {
        all: new Enumerable(this._parts).concat(this._named).skip(1),
        positional: new Enumerable(this._parts).skip(1),
        named: new Enumerable(this._named)
    };
}

export class BBNamedArg extends BBStructure {
    private readonly _parts: Array<BBString | BBSubTag> = [];

    public get name() { return getName(this._parts[0]); }
    public readonly values = new Enumerable(this._parts).skip(1);
}

class InvalidName extends Error {
    public readonly part: BBString | BBSubTag;
    constructor(part: BBString | BBSubTag) {
        super('Names must be BBStrings');
        this.part = part;
    }
}