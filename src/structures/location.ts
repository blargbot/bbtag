export class Location {
    public column: number;
    public line: number;

    constructor(line: number, column: number) {
        this.line = line;
        this.column = column;
    }
}

export class Range {
    public start: Location;
    public end: Location;

    constructor(start: Location, end: Location) {
        this.start = start;
        this.end = end;
    }
}