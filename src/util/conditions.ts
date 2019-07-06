import { bbtag, IStringToken } from '../language';

export type SubtagConditionFunc = (args: readonly IStringToken[]) => boolean;
// tslint:disable-next-line: interface-over-type-literal
export type SubtagConditionParser = { regex: RegExp, parser: (match: RegExpExecArray) => Exclude<SubtagCondition, string> | undefined };
export type SubtagCondition = SubtagConditionFunc | string | number;
export const conditionParsers: SubtagConditionParser[] = [];
export default conditionParsers;

conditionParsers.push(
    {
        regex: /^\s*?(<=?|>=?|={1,3}|!={0,2})\s*?(\d+)\s*?$/, //
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            const num = bbtag.number.deserialize(match[2]);
            switch (match[1]) {
                case '>': return args => args.length > num;
                case '>=': return args => args.length >= num;
                case '<': return args => args.length < num;
                case '<=': return args => args.length <= num;
                case '!':
                case '!=':
                case '!==': return args => args.length !== num;
                case '=':
                case '==':
                case '===': return args => args.length === num;
            }
        }
    }, {
        regex: /^\s*?(\d+)(!?)\s*?-\s*?(\d+)(!?)\s*?$/, // Matches anything of the form '1!-5!' (1 to 5 exclusive) or '1-5' (1 to 5 inclusive)
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            let from = bbtag.number.deserialize(match[1]);
            let to = bbtag.number.deserialize(match[3]);
            const includeFrom = !match[2];
            const includeTo = !match[4];
            if (from > to) {
                from = [to, to = from][0];
            }
            switch (toNumber(includeFrom, includeTo)) {
                case toNumber(true, true): return args => from <= args.length && args.length <= to;
                case toNumber(false, true): return args => from < args.length && args.length <= to;
                case toNumber(true, false): return args => from <= args.length && args.length < to;
                case toNumber(false, false): return args => from < args.length && args.length < to;
            }
        }
    }, {
        regex: /^\s*?\d+(?:\s*?,\s*?\d+)+\s*?$/, // Matches anything of the form '1, 2, 3, 4' etc
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            const counts: number[] = Array.from(match[0].match(/\d+/g) || [], bbtag.number.deserialize);
            return args => counts.indexOf(args.length) !== -1;
        }
    }
);

function toNumber(...values: boolean[]): number {
    let result = 0;
    let mult = 1;
    for (const bool of values) {
        result |= (bool ? 1 : 0) * mult;
        mult *= 2;
    }

    return result;
}