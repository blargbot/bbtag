"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Location {
    constructor(line, column) {
        this.line = line;
        this.column = column;
    }
}
exports.Location = Location;
class Range {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}
exports.Range = Range;
