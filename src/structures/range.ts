export class Range {
    public readonly start: Position;
    public readonly end: Position;

    public constructor(start: Position, end: Position) {
        this.start = start;
        this.end = end;
    }
}

export class Position {
    public static readonly initial: Position = new Position(0, 0, 0);
    public readonly offset: number;
    public readonly line: number;
    public readonly column: number;

    public constructor(offset: number, line: number, column: number) {
        this.offset = offset;
        this.line = line;
        this.column = column;
    }

    public nextColumn(count: number = 1): Position {
        return new Position(this.offset + count, this.line, this.column + count);
    }

    public nextLine(): Position {
        return new Position(this.offset + 1, this.line + 1, 0);
    }
}