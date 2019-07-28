import convert from './convert';
import { ISubtagConditionPattern, SubtagConditionFunc } from './types';

export const conditions = {
    patterns: [] as ISubtagConditionPattern[],
    parse(condition: string): SubtagConditionFunc {
        for (const { regex, parser } of conditions.patterns) {
            regex.lastIndex = 0;
            const match = regex.exec(condition);
            if (match !== null) {
                const parsed = parser(match);
                if (parsed !== undefined) {
                    return parsed;
                }
            }
        }
        throw new Error(`Unable to parse condition '${condition}'`);
    }
};

conditions.patterns.push(
    {
        regex: /^\s*?(<=?|>=?|={1,3}|!={0,2})\s*?(\d+)\s*?$/, //
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            const num = convert.toNumber(match[2]);
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
            let from = convert.toNumber(match[1]);
            let to = convert.toNumber(match[3]);
            const includeFrom = !match[2];
            const includeTo = !match[4];
            if (from > to) {
                from = [to, to = from][0];
            }

            const [compFrom, compTo] = [lt_(includeFrom), lt_(includeTo)];
            return args => compFrom(from, args.length) && compTo(args.length, to);
        }
    }, {
        regex: /^\s*?\d+(?:\s*?,\s*?\d+)+\s*?$/, // Matches anything of the form '1, 2, 3, 4' etc
        parser(match: RegExpExecArray): SubtagConditionFunc | undefined {
            const counts: number[] = Array.from(match[0].match(/\d+/g) || [], convert.toNumber);
            return args => counts.indexOf(args.length) !== -1;
        }
    }
);

function ltn(left: any, right: any): boolean { return left < right; }
function lte(left: any, right: any): boolean { return left <= right; }
function lt_(included: boolean): typeof ltn | typeof lte { return included ? lte : ltn; }

export default conditions;