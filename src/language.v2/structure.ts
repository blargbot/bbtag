import { Enumerable } from '../structures/enumerable';
import { StringSource } from '../structures/source';
import { Range } from '../structures/selection';

type BBSubtagArgs = {
    readonly all: Enumerable<BBString | BBSubTag | BBNamedArg>,
    readonly positional: Enumerable<BBString | BBSubTag>,
    readonly named: Enumerable<BBNamedArg>
};

type basicString = Array<string | basicSubTag>;
type basicSubTag = {
    name: basicString | basicSubTag,
    positional: Array<basicString | basicSubTag>
    named: Array<basicNamedArg>
};
type basicNamedArg = {
    name: basicString | basicSubTag,
    values: Array<basicString | basicSubTag>
};

export abstract class BBStructure {
    public readonly source: StringSource;
    public readonly range: Range;

    get content() { return this.source.get(this.range).trim(); }

    constructor(source: StringSource, range: Range) {
        this.source = source;
        this.range = range;
    }

    public abstract validate(names: string[]): void;
}

export class BBString extends BBStructure {
    public readonly parts: Enumerable<string | BBSubTag>;

    constructor(source: StringSource, range: Range, parts: Iterable<string | BBSubTag>) {
        super(source, range);
        this.parts = Enumerable.from(parts);
    }

    public toBasic(): basicString {
        return this.parts.map(part => {
            return typeof part === 'string' ? part : part.toBasic();
        }).toArray();
    }

    public validate() {

    }
}

export class BBSubTag extends BBStructure {
    public readonly name: BBString | BBSubTag;
    public readonly args: BBSubtagArgs;

    constructor(source: StringSource, range: Range, positionalArgs: Iterable<BBString | BBSubTag>, namedArgs: Iterable<BBNamedArg>) {
        super(source, range);

        let p = Enumerable.from(positionalArgs);
        let n = Enumerable.from(namedArgs);
        this.name = checkName(p.first(), range);
        this.args = {
            all: p.skip(1).concat(n),
            positional: p.skip(1),
            named: n
        };
    }

    public toBasic(): basicSubTag {
        return {
            name: this.name.toBasic(),
            positional: this.args.positional.map(arg => arg.toBasic()).toArray(),
            named: this.args.named.map(arg => arg.toBasic()).toArray()
        };
    }

    public validate() {

    }
}

export class BBNamedArg extends BBStructure {
    public readonly name: BBString | BBSubTag;
    public readonly values: Enumerable<BBString | BBSubTag>;

    constructor(source: StringSource, range: Range, parts: Iterable<BBString | BBSubTag>) {
        super(source, range);

        let v = Enumerable.from(parts);
        this.name = checkName(v.first(), range);
        this.values = v.skip(1);
    }

    public toBasic(): basicNamedArg {
        return {
            name: this.name.toBasic(),
            values: this.values.map(value => value.toBasic()).toArray()
        };
    }

    public validate() {
        if (!this.name.content.startsWith('*'))
            throw new ValidationError(this, 'The name of a Named Argument must start with a \'*\'');

        if (this.values.isEmpty())
            throw new ValidationError(this, 'Named args must be given atleast 1 value');
    }
}

function checkName(name: BBString | BBSubTag | undefined, range: Range): BBString | BBSubTag {
    if (name === undefined)
        throw new BBNameRequiredError(range);
    return name;
}

export class BBNameError extends Error {
    public readonly range: Range;
    constructor(message: string, range: Range) {
        super(message);
        this.range = range;
    }
}

export class BBNameRequiredError extends BBNameError {
    constructor(range: Range) {
        super('Names are not optional', range);
    }
}

export class ValidationError extends Error {
    public readonly structure: BBStructure;
    constructor(structure: BBStructure, message: string) {
        super(message);
        this.structure = structure;
    }
}