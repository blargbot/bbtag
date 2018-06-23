import { expect } from 'chai';
import { Floor } from '../../dist/subtags/math/floor';
import { Context } from '../../dist/structures/context';
import * as errors from '../../dist/structures/subtag.errors';
import { MockEngine } from '../mocks/mockEngine';
import { parse, BBSubTag } from '../../dist/language';

export function test() {
    let engine: MockEngine;
    let context: Context;

    beforeEach(() => {
        engine = new MockEngine();
        context = new Context(engine);
    });

    it('should have global names for backwards compatibility', async () => {
        // arrange
        let subtag = new Floor(engine);
        let expected = ['floor', 'rounddown'];

        // act & assert
        expect(subtag.globalNames).to.deep.equal(expected);
    });
    it('should return not enough args when given 0 args', async () => {
        // arrange
        let subtag = parse('{Math.Floor}').parts[0] as BBSubTag;
        let expected = errors.arguments.notEnough(1);

        // act
        let result = await new Floor(engine).execute(subtag, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(subtag, context));
    });
    it('should return too many args when given >1 args', async () => {
        // arrange
        let subtag = parse('{Math.Floor;1.23;4.56}').parts[0] as BBSubTag;
        let expected = errors.arguments.tooMany(1);

        // act
        let result = await new Floor(engine).execute(subtag, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(subtag, context));
    });
    it('should always round down', async () => {
        // arrange
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
            let result = await new Floor(engine).execute(subtag, context);

            // assert
            expect(context.state.errors).to.have.length(0);
            expect(result).to.equal(test.expected);
        }
    });
}