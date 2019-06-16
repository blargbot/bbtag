export class Range {
    public readonly start: Position;
    public readonly end: Position;

    public constructor(start: Position, end: Position) {
        this.start = start;
        this.end = end;
    }

    public slice(source: string): string {
        return source.slice(this.start.offset, this.end.offset);
    }

    public isEmpty(): boolean {
        return this.start.offset == this.end.offset;
    }
}

export class Position {
    public readonly offset: number;
    public readonly line: number;
    public readonly column: number;

    public constructor(offset: number, line: number, column: number) {
        this.offset = offset;
        this.line = line;
        this.column = column;
    }

    public nextColumn(count = 1): Position {
        return new Position(this.offset + count, this.line, this.column + count);
    }

    public nextLine(): Position {
        return new Position(this.offset + 1, this.line + 1, 0);
    }

    public static readonly initial: Position = new Position(0, 0, 0);
}