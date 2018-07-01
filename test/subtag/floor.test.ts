import { expect } from 'chai';
import { Floor } from '../../dist/subtags/general/math/floor';
import { Context, errors, BBSubTag, parse, Engine, SubTag } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';

export function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let floor = new Floor(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should execute all inner arguments', async () => {
        // arrange
        let expected = ['1.1'];
        let context = new Context(engine);
        let subtag = parse('{Math.Floor;{mock.echo;1.1}}').parts[0] as BBSubTag;

        // act
        await floor.execute(subtag, context);

        // assert
        expect(Echo.values).to.deep.equal(expected);
    })
    it('should have global names for backwards compatibility', async () => {
        // arrange
        let expected = ['floor', 'rounddown'];

        // act & assert
        expect(floor.globalNames).to.deep.equal(expected);
    });
    it('should return not enough args when given 0 args', async () => {
        // arrange
        let subtag = parse('{Math.Floor}').parts[0] as BBSubTag;
        let context = new Context(engine);
        let expected = errors.args.notEnough(1);

        // act
        let result = await floor.execute(subtag, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(subtag, context));
    });
    it('should return too many args when given >1 args', async () => {
        // arrange
        let subtag = parse('{Math.Floor;1.23;4.56}').parts[0] as BBSubTag;
        let context = new Context(engine);
        let expected = errors.args.tooMany(1);

        // act
        let result = await floor.execute(subtag, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(subtag, context));
    });
    it('should always round down', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [
            { input: '{Math.Floor;1}', expected: '1' },
            { input: '{Math.Floor;2.01}', expected: '2' },
            { input: '{Math.Floor;3.49}', expected: '3' },
            { input: '{Math.Floor;4.50}', expected: '4' },
            { input: '{Math.Floor;5.51}', expected: '5' },
            { input: '{Math.Floor;6.99}', expected: '6' },
        ]

        for (const test of cases) {
            let subtag = parse(test.input).parts[0] as BBSubTag;

            // act
            let result = await floor.execute(subtag, context);

            // assert
            expect(context.state.errors).to.have.length(0);
            expect(result).to.equal(test.expected);
        }
    });
}