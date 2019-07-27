// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { Position, Range } from '../../../lib';

describe('class Position', () => {
    it('should successfully construct', () => {
        // arrange
        const [offset, line, column] = [100, 5, 82];

        // act
        const result = new Position(offset, line, column);

        // assert
        expect(result.column).to.equal(column);
        expect(result.line).to.equal(line);
    });
});

describe('class Range', () => {
    it('should successfully construct', () => {
        // arrange
        const [start, end] = [new Position(1, 2, 3), new Position(8, 9, 10)];

        // act
        const result = new Range(start, end);

        // assert
        expect(result.start).to.equal(start);
        expect(result.end).to.equal(end);
    });
});