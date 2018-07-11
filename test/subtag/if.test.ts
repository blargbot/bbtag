import { expect } from 'chai';
import { If } from '../../dist/subtags/general/system/if';
import { Context, BBSubTag, parse, Engine, SubTag, errors, SubTagError } from '../../dist/index';
import { MockDb } from '../mocks/mockDatabase';
import { Echo } from '../mocks/subtags/echo';

type TestCase = { input: string[], expected: SubTagError | string, errors?: number, echo: string[] };

export = function test() {
    let engine: Engine = new Engine({ database: new MockDb() });
    let subtag = new If(engine);
    engine.register(Echo as typeof SubTag);

    afterEach(() => Echo.values.splice(0, Echo.values.length));

    it('should have global names for backwards compatibility', async () => {
        // arrange
        let expected = ['if'];

        // act & assert
        expect(subtag.globalNames).to.deep.equal(expected);
    });

    it('should return not enough args when given <2 args', async () => {
        // arrange
        let code = parse('{System.If}').parts[0] as BBSubTag;
        let context = new Context(engine);
        let expected = errors.args.notEnough(2);

        // act
        let result = await subtag.execute(code, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(code, context));
    });

    it('should return too many args when given >5 args', async () => {
        // arrange
        let code = parse('{System.If;a;b;c;d;e;f}').parts[0] as BBSubTag;
        let context = new Context(engine);
        let expected = errors.args.tooMany(5);

        // act
        let result = await subtag.execute(code, context);

        // assert
        expect(context.state.errors).to.have.length(1);
        expect(result).to.equal(await expected(code, context));
    });

    async function runTest(...cases: TestCase[]) {
        for (const entry of cases) {
            // arrange
            let code = parse(`{System.If;${entry.input.join(';')}}`).parts[0] as BBSubTag;
            let context = new Context(engine);
            entry.errors = entry.errors || 0;
            entry.echo = entry.echo || [];

            // act
            let result = await subtag.execute(code, context);

            // assert
            if (typeof entry.expected !== 'string') {
                entry.expected = await entry.expected(code, context);
                context.state.errors.pop();
            }
            let caseText = `When running '${code.content}' I expect it to return '${entry.expected}'`;

            expect(context.state.errors, caseText).to.have.length(entry.errors);
            expect(result, caseText).to.equal(entry.expected);
            expect(Echo.values, caseText).to.have.length(entry.echo.length);
            expect(Echo.values, caseText).to.deep.equal(entry.echo);

            Echo.values.splice(0, Echo.values.length);
        }
    }

    it('should accept a boolean and a `then`', async () => {
        await runTest(
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;success}'],
                expected: 'success',
                echo: ['true', 'success']
            },
            {
                input: ['{Mock.Echo;false}', '{Mock.Echo;failure}'],
                expected: '',
                echo: ['false']
            },
            {
                input: ['{Mock.Echo;notABool}', '{Mock.Echo;failure}'],
                expected: errors.value.notABool('notABool'),
                echo: ['notABool'],
                errors: 1
            });
    });

    it('should accept a boolean, a `then` and an `else`', async () => {
        await runTest(
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;success}', '{Mock.Echo;failure}'],
                expected: 'success',
                echo: ['true', 'success']
            },
            {
                input: ['{Mock.Echo;false}', '{Mock.Echo;failure}', '{Mock.Echo;success}'],
                expected: 'success',
                echo: ['false', 'success']
            },
            {
                input: ['{Mock.Echo;notABool}', '{Mock.Echo;failure}', '{Mock.Echo;failure}'],
                expected: errors.value.notABool('notABool'),
                echo: ['notABool'],
                errors: 1
            });
    });

    it('should accept a `value1`, an `operator`, a `value2` and a `then`', async () => {
        await runTest(
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;==}', '{Mock.Echo;true}', '{Mock.Echo;success}'],
                expected: 'success',
                echo: ['true', '==', 'true', 'success']
            },
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;!=}', '{Mock.Echo;true}', '{Mock.Echo;failure}'],
                expected: '',
                echo: ['true', '!=', 'true']
            },
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;notAnOperator}', '{Mock.Echo;true}', '{Mock.Echo;failure}'],
                expected: errors.value.notAComparer(['true', 'notAnOperator', 'true']),
                echo: ['true', 'notAnOperator', 'true'],
                errors: 1
            });
    });

    it('should accept a `value1`, an `operator`, a `value2`, a `then` and an `else`', async () => {
        await runTest(
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;==}', '{Mock.Echo;true}', '{Mock.Echo;success}', '{Mock.Echo;failure}'],
                expected: 'success',
                echo: ['true', '==', 'true', 'success']
            },
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;!=}', '{Mock.Echo;true}', '{Mock.Echo;failure}', '{Mock.Echo;success}'],
                expected: 'success',
                echo: ['true', '!=', 'true', 'success']
            },
            {
                input: ['{Mock.Echo;true}', '{Mock.Echo;notAnOperator}', '{Mock.Echo;true}', '{Mock.Echo;failure}', '{Mock.Echo;failure}'],
                expected: errors.value.notAComparer(['true', 'notAnOperator', 'true']),
                echo: ['true', 'notAnOperator', 'true'],
                errors: 1
            });
    });
}