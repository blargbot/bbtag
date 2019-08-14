import convert from './convert';
import { IBBTagConditionParser, SubtagConditionFunc } from './types';

export const conditions: IBBTagConditionParser = {
    patterns: [],
    parse(condition: string): SubtagConditionFunc {
        for (const { regex, parse } of conditions.patterns) {
            regex.lastIndex = 0;
            const match = regex.exec(condition);
            if (match !== null) {
                return parse(match);
            }
        }
        throw new Error(`Unable to parse condition '${condition}'`);
    }
};

conditions.patterns.push(
    {
        regex: /^\s*(\d+)\s*$/, // matches anything which is just a number
        parse(match: RegExpExecArray): SubtagConditionFunc {
            const num = convert.toNumber(match[1]);
            return args => args.length === num;
        }
    }, {
        regex: /^\s*?(<=?|>=?|={1,3}|!={0,2})\s*?(\d+)\s*?$/, // matches anything of the form '<=5' (less than or equal to 5) using any of the js comparison operators
        parse(match: RegExpExecArray): SubtagConditionFunc {
            const num = convert.toNumber(match[2]);
            switch (match[1] as '>' | '>=' | '<' | '<=' | '!' | '!=' | '!==' | '=' | '==' | '===') {
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
        parse(match: RegExpExecArray): SubtagConditionFunc {
            const [from, to] = [match[1], match[3]].map(convert.toNumber).sort();
            const includeFrom = !match[2];
            const includeTo = !match[4];

            const [compFrom, compTo] = [lt_(includeFrom), lt_(includeTo)];
            return args => compFrom(from, args.length) && compTo(args.length, to);
        }
    }, {
        regex: /^\s*?\d+(?:\s*?,\s*?\d+)+\s*?$/, // Matches anything of the form '1, 2, 3, 4' etc
        parse(match: RegExpExecArray): SubtagConditionFunc {
            const counts = Array.from(match[0].match(/\d+/g)!, convert.toNumber);
            return args => counts.includes(args.length);
        }
    }
);

function ltn(left: any, right: any): boolean { return left < right; }
function lte(left: any, right: any): boolean { return left <= right; }
function lt_(included: boolean): typeof ltn | typeof lte { return included ? lte : ltn; }

export default conditions;