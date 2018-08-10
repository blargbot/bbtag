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

export class BBString {
    private readonly _parts: Array<string | BBSubTag> = [];
    public readonly parts = new Enumerable(this._parts);
}

export class BBSubTag {
    private readonly _parts: Array<BBString | BBSubTag> = [];
    private readonly _named: Array<BBNamedArg> = [];

    public get name() { return getName(this._parts[0]); }
    public readonly args: BBSubtagArgs = {
        all: new Enumerable(this._parts).concat(this._named).skip(1),
        positional: new Enumerable(this._parts).skip(1),
        named: new Enumerable(this._named)
    };
}

export class BBNamedArg {
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