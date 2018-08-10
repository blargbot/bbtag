import { Enumerable } from '../dist/structures/enumerable';
import { expect } from 'chai';

describe('Enumerable', () => {
    describe('#from(source)', () => {
        it('Should successfully construct from an array', () => {
            // arrange
            let source = [1, 2, 3, 4];

            // act
            let result = Enumerable.from(source);

            // assert
            expect(result).to.exist;
            expect([...result]).to.deep.equal(source);
        });
    });

    describe('#count(predicate?)', () => {
        it('Should successfull count when given no predicate', () => {
            // arrange
            let source = [1, 2, 3, 4];
            let target = new Enumerable(source);

            // act
            let result = target.count();

            // assert
            expect(result).to.equal(source.length);
        });
    });
});