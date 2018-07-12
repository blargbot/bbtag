import { expect } from 'chai';
import { Floor } from '../../dist/subtags/general/math/floor';
import { Context, errors, BBSubTag, parse, Engine, SubTag } from '../../dist';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkBackwardsCompat, checkArgRange, contexts } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Floor(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    checkBackwardsCompat(subtag, 'floor', 'rounddown');
    checkArgRange(context, subtag, 1, 1);

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
            let code = parse(test.input).parts[0] as BBSubTag;

            // act
            let result = await subtag.execute(code, context);

            // assert
            expect(context.state.errors).to.have.length(0);
            expect(result).to.equal(test.expected);
        }
    });
}