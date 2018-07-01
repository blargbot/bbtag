import { expect } from 'chai';
import * as generic from '../../dist/util/generic';

export function test() {
    describe('#smartJoin()', () => {
        it('should successfully join an empty array', () => {
            // arrange
            let expected = '';
            let input: any[] = [];

            // act
            let result = generic.smartJoin(input, ', ', ' and ');

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully join an array with 1 item', () => {
            // arrange
            let expected = 'testing';
            let input = ['testing'];

            // act
            let result = generic.smartJoin(input, ', ', ' and ');

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully join an array with 2 items', () => {
            // arrange
            let expected = 'testing and fixing';
            let input = ['testing', 'fixing'];

            // act
            let result = generic.smartJoin(input, ', ', ' and ');

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully join an array with many items', () => {
            // arrange
            let expected = 'testing, fixing, coding and eating';
            let input = ['testing', 'fixing', 'coding', 'eating'];

            // act
            let result = generic.smartJoin(input, ', ', ' and ');

            // assert
            expect(result).to.equal(expected);
        });
    });
}