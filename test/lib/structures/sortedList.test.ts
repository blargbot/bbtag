// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { SortedList } from '../../..';

interface ITestData { name: string; }

const testData: readonly ITestData[] = [
    { name: 'e' },
    { name: 'a' },
    { name: 'd' },
    { name: 'b' },
    { name: 'c' }
];
const ascending: readonly ITestData[] = [1, 3, 4, 2, 0].map(i => testData[i]);
const descending: readonly ITestData[] = [0, 2, 4, 3, 1].map(i => testData[i]);

describe('class SortedList', () => {
    it('should correctly add elements with default ordering being ascending', () => {
        // arrange
        const list = new SortedList<ITestData>(entry => entry.name);

        // act
        list.add(...testData);

        // assert
        expect([...list]).to.deep.equal(ascending);
    });
    it('should correctly add elements in ascending order', () => {
        // arrange
        const list = new SortedList<ITestData>(entry => entry.name, false);

        // act
        list.add(...testData);

        // assert
        expect([...list]).to.deep.equal(ascending);
    });
    it('should correctly add elements in descending order', () => {
        // arrange
        const list = new SortedList<ITestData>(entry => entry.name, true);

        // act
        list.add(...testData);

        // assert
        expect([...list]).to.deep.equal(descending);
    });
    it('should correctly delete elements', () => {
        // arrange
        const list = new SortedList<ITestData>(entry => entry.name);
        list.add(...testData);
        const expected = [0, 2, 3].map(i => ascending[i]);
        const remove = [4, 1].map(i => ascending[i]);

        // act
        list.delete(...remove);

        // assert
        expect([...list]).to.deep.equal(expected);
    });
    it('should not delete elements which do not exist', () => {
        // arrange
        const list = new SortedList<ITestData>(entry => entry.name);
        list.add(...testData);

        // act
        list.delete({ name: 'f' });

        // assert
        expect([...list]).to.deep.equal(ascending);
    });
    it('should correctly toArray', () => {
        // arrange
        const list = new SortedList<ITestData>(entry => entry.name);
        list.add(...testData);

        // act
        const result = list.toArray();

        // assert
        expect(result).to.deep.equal(ascending);
    });
});