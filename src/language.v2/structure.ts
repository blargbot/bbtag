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

    public abstract validate(): Enumerable<ValidationError>;

    /** Converts this into a minimal form. Useful for debugging. */
    public abstract toBasic(): any;

    public toString(): string {
        return this.content;
    }
}

export class BBString extends BBStructure {
    public readonly parts: Enumerable<string | BBSubTag>;

    constructor(source: StringSource, range: Range, parts: Iterable<string | BBSubTag>) {
        super(source, range);
        this.parts = Enumerable.from(parts);
    }

    /** Converts this into a minimal form. Useful for debugging. */
    public toBasic(): basicString {
        return this.parts.map(part => {
            return typeof part === 'string' ? part : part.toBasic();
        }).toArray();
    }

    public validate(): Enumerable<ValidationError> {
        return this.parts
            .filter<BBSubTag>(function (part): part is BBSubTag { return typeof part !== 'string'; })
            .mapMany(part => part.validate());
    }
}

export class BBSubTag extends BBStructure {
    public readonly name: BBString | BBSubTag;
    public readonly args: BBSubtagArgs;

    constructor(source: StringSource, range: Range, positionalArgs: Iterable<BBString | BBSubTag>, namedArgs: Iterable<BBNamedArg>) {
        super(source, range);

        let positional = Enumerable.from(positionalArgs);
        let named = Enumerable.from(namedArgs);
        this.name = checkName(positional.first(), range);
        positional = positional.skip(1).exhaust();
        this.args = {
            all: positional.concat(named),
            positional,
            named
        };
    }

    /** Converts this into a minimal form. Useful for debugging. */
    public toBasic(): basicSubTag {
        return {
            name: this.name.toBasic(),
            positional: this.args.positional.map(arg => arg.toBasic()).toArray(),
            named: this.args.named.map(arg => arg.toBasic()).toArray()
        };
    }

    public validate(): Enumerable<ValidationError> {
        let self = this;
        return Enumerable.from(function* () {
            if (self.name.content.startsWith('*'))
                yield new ValidationError(self, 'The name of a SubTag must not start with a \'*\'');

            if (!self.name.content)
                yield new ValidationError(self, 'Unnamed SubTag');

            yield* self.name.validate();

            for (const arg of self.args.all)
                yield* arg.validate();
        });
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

    /** Converts this into a minimal form. Useful for debugging. */
    public toBasic(): basicNamedArg {
        return {
            name: this.name.toBasic(),
            values: this.values.map(value => value.toBasic()).toArray()
        };
    }

    public validate(): Enumerable<ValidationError> {
        let self = this;
        return Enumerable.from(function* () {
            if (!self.name.content.startsWith('*'))
                yield new ValidationError(self, 'The name of a Named Argument must start with a \'*\'');

            if (self.values.isEmpty())
                yield new ValidationError(self, 'Named args must be given atleast 1 value');

            yield* self.name.validate();

            for (const value of self.values)
                yield* value.validate();
        });
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

export class ValidationError {
    public readonly structure: BBStructure;
    public readonly message: string;
    constructor(structure: BBStructure, message: string) {
        this.message = message;
        this.structure = structure;
    }
}