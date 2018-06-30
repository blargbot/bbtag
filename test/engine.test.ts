import { expect } from 'chai';
import { Engine } from '../dist/engine';
import { MockDb } from './mocks/mockDatabase';
import { subtags } from './mocks/subtags';
import { SubTag, parse, Context } from '../dist';
import { FuncHandler } from './mocks/subtags/func';

describe('Engine', () => {
    describe('#register()', () => {
        it('should successfully register subtags', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });

            // act
            engine.register(subtags[0]);

            // assert
            expect(engine.subtags.members).to.have.length(1);
            expect(engine.subtags.members[0]).to.be.instanceof(subtags[0]);
        });
        it('should not register duplicate subtags', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });
            engine.register(subtags[0] as typeof SubTag);

            // act
            engine.register(subtags[0] as typeof SubTag);

            // assert
            expect(engine.subtags.members).to.have.length(1);
        });
    });
    describe('#remove()', () => {
        it('should successfully remove subtags', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });
            engine.subtags.add(new (<any>subtags[0])(engine));

            // act
            engine.remove(subtags[0] as typeof SubTag);

            // assert
            expect(engine.subtags.members).to.have.length(0);
        });
        it('should remove multiple subtags of the same instance', () => {
            // arrange
            let engine = new Engine({ database: new MockDb() });
            engine.subtags.add(new (<any>subtags[0])(engine));
            engine.subtags.add(new (<any>subtags[0])(engine));

            // act
            engine.remove(subtags[0] as typeof SubTag);

            // assert
            expect(engine.subtags.members).to.have.length(0);
        });
    });
    describe('#execute()', () => {
        let engine = new Engine({ database: new MockDb() });
        engine.register(...subtags);
        it('should successfully error when unknown subtag is given', async () => {
            // arrange
            let expected = '`[1:1][BB-S-US] Unknown subtag \'notasubtag\'`';
            let subtag = parse('{notasubtag}');
            let context = new Context(engine, {});

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully handle internal server errors', async () => {
            // arrange
            let expected = '`[1:1][BB-S-IS] An internal server error has occurred`';
            let subtag = parse('{mocks.ise}');
            let context = new Context(engine, {});

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully execute a plain string', async () => {
            // arrange
            let expected = 'this is a test';
            let subtag = parse(expected);
            let context = new Context(engine, {});

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully execute a single level string', async () => {
            // arrange
            let expected = 'this, is, a, test';
            let subtag = parse('{mocks.join;this;is;a;test}');
            let context = new Context(engine, {});

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully execute a nested string', async () => {
            // arrange
            let expected = 'this, is, a, test';
            let subtag = parse('{mocks.join;{mocks.join;this;is};a;test}');
            let context = new Context(engine, {});

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
        it('should successfully execute a context function', async () => {
            // arrange
            let expected = 'this is a test';
            let func = parse(expected);
            let subtag = parse('{MockFunc.test}');
            let context = new Context(engine, {});
            context.functions.add(new FuncHandler(engine, 'test', func));

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
        it('should be case insensitive for subtag names', async () => {
            // arrange
            let expected = 'this, is, a, test';
            let subtag = parse('{MoCkS.JoIn;this;is;a;test}');
            let context = new Context(engine, {});

            // act
            let result = await engine.execute(subtag, context);

            // assert
            expect(result).to.equal(expected);
        });
    });
});