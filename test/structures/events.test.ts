// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { EventManager } from '../../src/structures';
import { AggregateError } from '../../src/structures/errors';
import { resultOf } from '../test helpers/utility';

interface ITestEvents {
    test1: (arg1: { name: string }) => string;
    test2: (arg1: number) => any;
}

describe('EventManager', () => {
    it('should successfully register and invoke handler', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = obj => obj === input ? 'handler1' : 'INCORRECT';
        const handler2: ITestEvents['test1'] = obj => obj === input ? 'handler2' : 'INCORRECT';
        const handler3: ITestEvents['test2'] = num => num;
        const input = { name: 'success' };
        const expected = ['handler1', 'handler2'];

        // act
        manager.on('test1', handler1);
        manager.on('test1', handler2);
        manager.on('test2', handler3);
        const results = manager.raise('test1', input);

        // assert
        expect(results).to.deep.equal(expected);
    });
    it('should gracefully handle an unregistered event', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const input = { name: 'success' };
        const expected: string[] = [];

        // act
        const results = manager.raise('test1', input);

        // assert
        expect(results).to.deep.equal(expected);
    });
    it('should successfully unregister handler', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = () => 'INCORRECT';
        const handler2: ITestEvents['test1'] = obj => obj === input ? 'handler2' : 'INCORRECT';
        manager.on('test1', handler1);
        manager.on('test1', handler2);
        const input = { name: 'success' };
        const expected = ['handler2'];

        // act
        manager.off('test1', handler1);
        const results = manager.raise('test1', input);

        // assert
        expect(results).to.deep.equal(expected);
    });
    it('should successfully unregister final handler for event', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = () => 'INCORRECT';
        const handler2: ITestEvents['test1'] = obj => obj === input ? 'handler2' : 'INCORRECT';
        manager.on('test1', handler1);
        manager.on('test1', handler2);
        const input = { name: 'success' };
        const expected: string[] = [];

        // act
        manager.off('test1', handler1);
        manager.off('test1', handler2);
        const results = manager.raise('test1', input);

        // assert
        expect(results).to.deep.equal(expected);
    });
    it('should gracefully fail to unregister handler for unregistered event', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = () => 'INCORRECT';
        const input = { name: 'success' };
        const expected: string[] = [];

        // act
        manager.off('test1', handler1);
        const results = manager.raise('test1', input);

        // assert
        expect(results).to.deep.equal(expected);
    });
    it('should gracefully fail to unregister handler which is not registered', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = () => 'INCORRECT';
        const handler2: ITestEvents['test1'] = obj => obj === input ? 'handler2' : 'INCORRECT';
        manager.on('test1', handler2);
        const input = { name: 'success' };
        const expected = ['handler2'];

        // act
        manager.off('test1', handler1);
        const results = manager.raise('test1', input);

        // assert
        expect(results).to.deep.equal(expected);
    });
    it('should successfully clear an event', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = obj => obj === input1 ? 'handler1' : 'INCORRECT';
        const handler2: ITestEvents['test1'] = obj => obj === input1 ? 'handler2' : 'INCORRECT';
        const handler3: ITestEvents['test2'] = num => num;
        manager.on('test1', handler1);
        manager.on('test1', handler2);
        manager.on('test2', handler3);
        const input1 = { name: 'success' };
        const input2 = 5;
        const expected1: string[] = [];
        const expected2: number[] = [input2];

        // act
        manager.clear('test1');
        const results1 = manager.raise('test1', input1);
        const results2 = manager.raise('test2', input2);

        // assert
        expect(results1).to.deep.equal(expected1);
        expect(results2).to.deep.equal(expected2);
    });
    it('should successfully clear all events', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = obj => obj === input1 ? 'handler1' : 'INCORRECT';
        const handler2: ITestEvents['test1'] = obj => obj === input1 ? 'handler2' : 'INCORRECT';
        const handler3: ITestEvents['test2'] = num => num;
        manager.on('test1', handler1);
        manager.on('test1', handler2);
        manager.on('test2', handler3);
        const input1 = { name: 'success' };
        const input2 = 5;
        const expected1: string[] = [];
        const expected2: number[] = [];

        // act
        manager.clear();
        const results1 = manager.raise('test1', input1);
        const results2 = manager.raise('test2', input2);

        // assert
        expect(results1).to.deep.equal(expected1);
        expect(results2).to.deep.equal(expected2);
    });
    it('should successfully handle a handler which throws', () => {
        // arrange
        const manager = new EventManager<ITestEvents>();
        const handler1: ITestEvents['test1'] = obj => obj === input ? 'handler1' : 'INCORRECT';
        const handler2: ITestEvents['test1'] = () => { throw expected; };
        const handler3: ITestEvents['test1'] = obj => obj === input ? 'handler3' : 'INCORRECT';
        const input = { name: 'success' };
        const expected = new Error();

        // act
        manager.on('test1', handler1);
        manager.on('test1', handler2);
        manager.on('test1', handler3);
        const result = resultOf(() => manager.raise('test1', input));

        // assert
        expect(result)
            .to.be.instanceOf(AggregateError)
            .and.property('innerErrors')
            .to.contain(expected);
    });
});