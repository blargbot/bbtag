import { expect } from 'chai';
import { Named1, Named2, NamedPriority, NamedConditional } from '../mocks/subtags/named';
import { Context, errors, BBSubTag, parse, Engine, SubTag } from '../../dist';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';
import { checkBackwardsCompat, checkArgRange, contexts } from './util';
import { SubTagError } from '../../dist/structures/subtag';

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag1 = new Named1(engine);
    let subtag2 = new Named2(engine);
    let subtagp = new NamedPriority(engine);
    let subtagc = new NamedConditional(engine);
    let context = contexts.basic(engine);
    engine.register(Echo as typeof SubTag);
    engine.register(Named1 as typeof SubTag);
    engine.register(Named2 as typeof SubTag);
    engine.register(NamedPriority as typeof SubTag);
    engine.register(NamedConditional as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    async function test(context: Context, cases: { input: string, expected: string | SubTagError, subtag: SubTag<Context>, errors?: number }[]) {
        for (const test of cases) {
            let code = parse(test.input).parts[0] as BBSubTag;

            // act
            let result = await test.subtag.execute(code, context);

            if (!test.errors && context.state.errors.length > 0)
                for (const err of context.state.errors)
                    console.error(err);
            // assert
            expect(context.state.errors).to.have.length(test.errors === undefined ? 0 : test.errors);
            expect(result).to.equal(test.expected);
        }
    }

    it('should parse named arguments', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [{
            input: '{named={*arg1;1}{*arg2;2}{*arg3;3}{*arg4;4}{*arg5;5}}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4"],"arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named={*arg1;1}{*arg2;2}{*arg3;3}{*arg4;4}{*arg4;4}{*arg5;5}}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4","4"],"arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named={*arg1;1}{*arg3;3}{*arg4;4}{*arg4;4}{*arg5;5}}',
            expected: `Four1 {"arg1":"1","arg3":"3","arg4":["4","4"],"arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named={*arg1;1}{*arg2;2}{*arg3;3}{*arg5;5}}',
            expected: `Four2 {"arg1":"1","arg2":"2","arg3":"3","arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named={*arg1;1}{*arg3;3}{*arg5;5}}',
            expected: `Three {"arg1":"1","arg3":"3","arg5":"5"}`,
            subtag: subtag1
        }];
        await test(context, cases);
    });
    it('should parse positional arguments as named arguments', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [{
            input: '{named;1;2;3;4;5}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4"],"arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named;1;2;3;4;4;5}',
            expected: `Five {"arg1":"1","arg2":"2","arg3":"3","arg4":["4","4"],"arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named;1;2;3;5}',
            expected: `Four2 {"arg1":"1","arg2":"2","arg3":"3","arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named;1;3;5}',
            expected: `Three {"arg1":"1","arg3":"3","arg5":"5"}`,
            subtag: subtag1
        }, {
            input: '{named;1;3;4;5}',
            expected: `Four1 {"arg1":"1","arg3":"3","arg4":["4"],"arg5":"5"}`,
            subtag: subtag2
        }];
        await test(context, cases);
    });
    it('should parse positional arguments with priority', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [{
            input: '{named;1;2}',
            expected: `Two {"arg1":"1","arg2":"2"}`,
            subtag: subtagp
        }, {
            input: '{named;2}',
            expected: `One {"arg2":"2"}`,
            subtag: subtagp
        }];
        await test(context, cases);
    });
    it('should parse positional arguments with conditions', async () => {
        // arrange
        let context = new Context(engine);
        let cases = [{
            input: '{named;1;2;3;4}',
            expected: `Four {"arg1":"1","arg2":"2","arg3":"3","arg4":"4"}`,
            subtag: subtagc
        }, {
            input: '{named;4}',
            expected: `One {"arg4":"4"}`,
            subtag: subtagc
        }, {
            input: '{named;1;2;3}',
            expected: `Three {"arg1":"1","arg2":"2","arg3":"3"}`,
            subtag: subtagc
        }, {
            input: '{named;1;2}',
            expected: '`[1:1][BB-A-TM] Too many arguments. Maximum 4`',
            subtag: subtagc,
            errors: 1
        }];
        await test(context, cases);
    });
};