export declare class Location {
    column: number;
    line: number;
    constructor(line: number, column: number);
}
export declare class Range {
    start: Location;
    end: Location;
    constructor(start: Location, end: Location);
}
