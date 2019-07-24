export class Position {
    public readonly offset: number;
    public readonly line: number;
    public readonly column: number;

    public constructor(offset: number, line: number, column: number) {
        this.offset = offset;
        this.line = line;
        this.column = column;
    }

    public toString(): string {
        return `[${this.offset}:${this.line}:${this.column}]`;
    }
}

export class Range {
    public readonly start: Position;
    public readonly end: Position;

    public constructor(start: Position, end: Position) {
        this.start = start;
        this.end = end;
    }

    public toString(): TokenRange {
        return TokenRange.from(this);
    }
}

export type TokenRange = string & { ['PhantomType:TokenRange']: never };
interface ITokenRangeGuard {
    from(value: string): TokenRange;
    from(start: Position, end: Position): TokenRange;
    from(range: Range): TokenRange;
    asRange(value: TokenRange): Range;
    check(value: string): value is TokenRange;
}

export const TokenRange: ITokenRangeGuard = {
    from(...args: [string] | [Range] | [Position, Position]): TokenRange {
        if (args.length === 2) {
            return args.map(a => a.toString()).join(':') as TokenRange;
        }
        const arg = args[0];
        if (typeof arg === 'string') {
            if (TokenRange.check(arg)) {
                return arg;
            }
            throw new Error(`Value '${arg}' is not convertable to a TokenRange`);
        }
        return TokenRange.from(arg.start, arg.end);
    },

    asRange(value: TokenRange): Range {
        const parts = value.match(tokenRangeRegex)!;
        return new Range(
            new Position(...parts.slice(1, 4).map(Number) as [0, 0, 0]),
            new Position(...parts.slice(4, 7).map(Number) as [0, 0, 0])
        );
    },

    check(value: string): value is TokenRange {
        return tokenRangeRegex.test(value);
    }
};

const tokenRangeRegex = /^\[(\d+):(\d+):(\d+)\]:\[(\d+):(\d+):(\d+)\]$/;