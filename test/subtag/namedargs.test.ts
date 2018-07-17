import { expect } from 'chai';
import { Named } from '../mocks/subtags/named';
import { Context, errors, BBSubTag, parse, Engine, SubTag } from '../../dist';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkBackwardsCompat, checkArgRange, contexts } from './util';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new Named(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);
    engine.register(Named as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should parse named arguments', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [{
            input: '{named={*arg1;1}{*arg2;2}{*arg3;3}{*arg4;4}{*arg5;5}}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4"],"arg5":"5"}`
        }, {
            input: '{named={*arg1;1}{*arg2;2}{*arg3;3}{*arg4;4}{*arg4;4}{*arg5;5}}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4","4"],"arg5":"5"}`
        }, {
            input: '{named={*arg1;1}{*arg3;3}{*arg4;4}{*arg4;4}{*arg5;5}}',
            expected: `Four1 {"arg1":"1","arg3":"3","arg4":["4","4"],"arg5":"5"}`
        }, {
            input: '{named={*arg1;1}{*arg2;2}{*arg3;3}{*arg5;5}}',
            expected: `Four2 {"arg1":"1","arg2":"2","arg3":"3","arg5":"5"}`
        }, {
            input: '{named={*arg1;1}{*arg3;3}{*arg5;5}}',
            expected: `Three {"arg1":"1","arg3":"3","arg5":"5"}`
        }]
        for (const test of cases) {
            let code = parse(test.input).parts[0] as BBSubTag;

            // act
            let result = await subtag.execute(code, context);

            // assert
            expect(context.state.errors).to.have.length(0);
            expect(result).to.equal(test.expected);
        }
    });
    it('should parse positional arguments as named arguments', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [{
            input: '{named;1;2;3;4;5}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4"],"arg5":"5"}`
        }, {
            input: '{named;1;2;3;4;4;5}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4","4"],"arg5":"5"}`
        }, {
            input: '{named;1;3;4;4;5}',
            expected: `Four1 {"arg1":"1","arg3":"3","arg4":["4","4"],"arg5":"5"}`
        }, {
            input: '{named;1;2;3;5}',
            expected: `Four2 {"arg1":"1","arg2":"2","arg3":"3","arg5":"5"}`
        }, {
            input: '{named;1;3;5}',
            expected: `Three {"arg1":"1","arg3":"3","arg5":"5"}`
        }]
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