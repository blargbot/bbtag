import { SubTagError, parse, Context, Engine, SubTag, BBSubTag } from "../../dist";
import { expect } from "chai";
import { Echo } from "../mocks/subtags/echo";
import { Operator } from "../../dist/subtags/general/system/operator";
import { Bool } from "../../dist/subtags/general/system/bool";
import { MockDb } from "../mocks/mockDatabase";

export type TestCase = { input: string[], expected: SubTagError | string, errors?: number, echo: string[] };

export const contexts = {
    basic: (engine: Engine) => () => new Context(engine)
}

export async function runTest(makeContext: () => Context, subtag: SubTag<any>, ...cases: TestCase[]) {
    for (const entry of cases) {
        // arrange
        let name = (subtag.category ? subtag.category + '.' : '') + subtag.name;
        let code = parse(`{${name}${['', ...entry.input.map(input => `{_;${input}}`)].join(';')}}`).parts[0] as BBSubTag;
        code.resolvedName = name;
        let context = makeContext();
        entry.errors = entry.errors || 0;
        entry.echo = entry.echo || [];

        // act
        let result = await subtag.execute(code, context);

        // assert
        if (typeof entry.expected !== 'string') {
            entry.expected = await entry.expected(code, context);
            context.state.errors.pop();
        }

        expect(context.state.errors, `When running '${code.content}' I expect it to result in ${entry.errors} errors`)
            .to.have.length(entry.errors);
        expect(result, `When running '${code.content}' I expect it to return '${entry.expected}'`)
            .to.equal(entry.expected);
        expect(Echo.values, `When running '${code.content}' I expect it to internally resolve ${entry.echo} as arguments only`)
            .to.deep.equal(entry.echo);

        Echo.values.splice(0, Echo.values.length);
    }
}

export function checkBackwardsCompat(subtag: SubTag<any>, ...oldNames: string[]) {
    it('should have global names for backwards compatibility', async () => {
        // act & assert
        expect(subtag.globalNames).to.deep.equal(oldNames);
    });
}

export function checkArgRange(makeContext: () => Context, subtag: SubTag<any>, min: number | null, max: number | null) {
    if (min != null) {
        it(`should return not enough args if given <${min} args`, async () => {
            await runTest(makeContext, subtag,
                {
                    input: [...Array(min - 1).keys()].map(key => `arg${key}`),
                    expected: subtag.errors.args.notEnough(min),
                    echo: [],
                    errors: 1
                })
        })
    }
    if (max != null) {
        it(`should return too many args if given >${max} args`, async () => {
            await runTest(makeContext, subtag,
                {
                    input: [...Array(max + 1).keys()].map(key => `arg${key}`),
                    expected: subtag.errors.args.tooMany(max),
                    echo: [],
                    errors: 1
                })
        })
    }
}

export function checkLoadOperators(subtag: (engine: Engine) => SubTag<any>, operators: string[]) {
    it('should load operators into System.Operator', () => {
        // arrange
        let engine = new Engine({ database: new MockDb() });
        let operator = new Operator(engine);

        // act
        engine.subtags.add(operator);
        engine.subtags.add(subtag(engine));

        // assert
        expect(operator.globalNames).to.deep.equal(operators);
    });
}