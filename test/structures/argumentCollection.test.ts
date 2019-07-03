// tslint:disable-next-line: no-implicit-dependencies
import { expect } from 'chai';
import { ArgumentCollection, ExecutionContext, IStringToken, SubtagError } from '../../src/structures';
import { MockExecutionContext } from '../test helpers/mocks';
import { str, tag } from '../test helpers/subtag';
import { resultOf } from '../test helpers/utility';

const testToken = tag(str('test'), str('arg0'), str('arg1'), str('arg2'), str('arg3'));

describe('class ArgumentCollection', () => {
    it('should successfully construct', () => {
        // arrange
        const context = new MockExecutionContext();

        // act
        const result = new ArgumentCollection(context, testToken);

        // assert
        expect(result.context).to.equal(context);
        expect(result.token).to.equal(testToken);
    });
    describe('#getRaw', () => {
        it('should successfully getRaw a single value', () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);

            // act
            const result = args.getRaw(1);

            // assert
            expect(result).to.equal(testToken.args[1]);
        });
        it('should successfully getRaw multiple values', () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);

            // act
            const result = args.getRaw(2, 1);

            // assert
            expect([...result]).to.have.ordered.members([testToken.args[2], testToken.args[1]]);
        });
        it('should gracefully fail to getRaw when out of bounds', () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);

            // act
            const result1 = args.getRaw(10);
            const result2 = args.getRaw(1, 2, 6);

            // assert
            expect(result1).to.be.undefined;
            expect([...result2]).to.have.ordered.members([testToken.args[1], testToken.args[2], undefined]);
        });
    });
    describe('#execute', () => {
        it('should successfully execute a single value', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 2;
            const arg = testToken.args[index];
            const expected = new SubtagError(context, arg);
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.equal(arg);
                expect(c).to.equal(context);
                return expected;
            };

            // act
            const result = await args.execute(index);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully execute multiple values', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const indexes = [3, 1];
            const arg = indexes.map(i => testToken.args[i]);
            const expected = arg.map(a => new SubtagError(context, a));
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.be.oneOf(arg);
                expect(c).to.equal(context);
                return expected[arg.indexOf(t)];
            };

            // act
            const result = await args.execute(...indexes);

            // assert
            expect(result).to.have.ordered.members(expected);
        });
        it('should gracefully fail to execute when out of bounds', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 10;

            // act
            const result = await args.execute(index);

            // assert
            expect(result).to.be.undefined;
        });
        it('should not execute duplicate indexes more than once', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 2;
            const arg = testToken.args[index];
            const expected = new SubtagError(context, arg);
            let callCount = 0;
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.equal(arg);
                expect(c).to.equal(context);
                callCount++;
                return expected;
            };

            // act
            const result = await args.execute(index, index, index, index);

            // assert
            expect(result).to.have.ordered.members([expected, expected, expected, expected]);
            expect(callCount).to.equal(1);
        });
        it('should not execute values more than once', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 2;
            const arg = testToken.args[index];
            const expected = new SubtagError(context, arg);
            let callCount = 0;
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.equal(arg);
                expect(c).to.equal(context);
                callCount++;
                return expected;
            };

            // act
            const result = [
                await args.execute(index),
                await args.execute(index),
                await args.execute(index),
                await args.execute(index)
            ];

            // assert
            expect(result).to.have.ordered.members([expected, expected, expected, expected]);
            expect(callCount).to.equal(1);
        });
    });
    describe('#executeAll', () => {
        it('should successfully execute all values', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const expected = testToken.args.map(t => new SubtagError(context, t));
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.be.oneOf(testToken.args);
                expect(c).to.equal(context);
                return expected[testToken.args.indexOf(t)];
            };

            // act
            const result = await args.executeAll();

            // assert
            expect([...result]).to.have.ordered.members(expected);
        });
        it('should not execute arguments multiple times', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const expected = testToken.args.map(t => new SubtagError(context, t));
            const callCount = expected.map(_ => 0);
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.be.oneOf(testToken.args);
                expect(c).to.equal(context);
                callCount[testToken.args.indexOf(t)]++;
                return expected[testToken.args.indexOf(t)];
            };

            // act
            await args.executeAll();
            await args.executeAll();
            await args.executeAll();
            const result = await args.executeAll();

            // assert
            expect([...result]).to.have.ordered.members(expected);
            expect(callCount).to.have.ordered.members(callCount.map(_ => 1));
        });
    });
    describe('#get', () => {
        it('should successfully get a single cached value', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 3;
            const arg = testToken.args[index];
            const expected = new SubtagError(context, arg);
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.equal(arg);
                expect(c).to.equal(context);
                return expected;
            };
            await args.execute(index);

            // act
            const result = args.get(index);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully get multiple cached values', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const indexes = [3, 1];
            const arg = indexes.map(i => testToken.args[i]);
            const expected = arg.map(a => new SubtagError(context, a));
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.be.oneOf(arg);
                expect(c).to.equal(context);
                return expected[arg.indexOf(t)];
            };
            await args.execute(...indexes);

            // act
            const result = args.get(...indexes);

            // assert
            expect([...result]).to.have.ordered.members(expected);
        });
        it('should fail to get an uncached value', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 10;

            // act
            const result = resultOf(() => args.get(index));

            // assert
            expect(result).to.be.instanceOf(Error);
        });
        it('should fail to get an out of bounds value even after executing it', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const index = 10;
            await args.execute(index);

            // act
            const result = resultOf(() => args.get(index));

            // assert
            expect(result).to.be.instanceOf(Error);
        });
    });
    describe('#getAll', () => {
        it('should successfully get all values if cached', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const expected = testToken.args.map(t => new SubtagError(context, t));
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.be.oneOf(testToken.args);
                expect(c).to.equal(context);
                return expected[testToken.args.indexOf(t)];
            };
            await args.executeAll();

            // act
            const result = args.getAll();

            // assert
            expect([...result]).to.have.ordered.members(expected);
        });
        it('should fail to getAll if not all values have been executed', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            const expected = testToken.args.map(t => new SubtagError(context, t));
            context.engine.execute = (t: IStringToken, c: ExecutionContext) => {
                expect(t).to.be.oneOf(testToken.args);
                expect(c).to.equal(context);
                return expected[testToken.args.indexOf(t)];
            };
            await args.execute(0, 1, 2);

            // act
            const result = resultOf(() => [...args.getAll()]);

            // assert
            expect(result).to.be.instanceOf(Error);
        });
    });
    describe('#has', () => {
        it('should return true if index is in bounds', () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);

            // act
            const result = args.has(0, 1, 2, 3);

            // assert
            expect(result).to.be.true;
        });
        it('should return false if index is below bounds', () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);

            // act
            const result = args.has(0, 1, -1, 2, 3);

            // assert
            expect(result).to.be.false;
        });
        it('should return false if index is above bounds', () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);

            // act
            const result = args.has(0, 1, 4, 2, 3);

            // assert
            expect(result).to.be.false;
        });
    });
    describe('#hasExecuted', () => {
        it('should return true if all indexes has been executed', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            await args.execute(0, 1, 2, 3);

            // act
            const result = args.hasExecuted(0, 1, 2, 3);

            // assert
            expect(result).to.be.true;
        });
        it('should return false if any index has not been executed', async () => {
            // arrange
            const context = new MockExecutionContext();
            const args = new ArgumentCollection(context, testToken);
            await args.execute(0, 1, 3);

            // act
            const result = args.hasExecuted(0, 1, 2, 3);

            // assert
            expect(result).to.be.false;
        });
    });
});