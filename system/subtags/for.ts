import { SystemSubtag } from '..';
import { argumentBuilder as A, ArgumentCollection, bbtag, SubtagResult, validation } from '../..';
import { default as bool } from './bool';

export class ForSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'for',
            category: 'system',
            arguments: [A.r('variable'), A.r('initial'), A.r('comparison'), A.r('limit'), A.o('increment'), A.r('code')],
            description:
                'To start, `variable` is set to `initial`. Then, the tag will loop, ' +
                'first checking `variable` against `limit` using `comparison`. ' +
                'If the check succeeds, `code` will be run before `variable` being ' +
                'incremented by `increment` and the cycle repeating.\n' +
                'This is very useful for repeating an action (or similar action) a ' +
                'set number of times. Edits to `variable` inside `code` will be ignored',
            examples: [
                { code: '{for;~index;0;<;10;{get;~index},}', output: '0,1,2,3,4,5,6,7,8,9,' }
            ]
        });

        this.whenArgs('0-4', validation.notEnoughArgs)
            .whenArgs('5', this.run, [0, 1, 2, 3])
            .whenArgs('6', this.run, [0, 1, 2, 3, 4])
            .default(validation.tooManyArgs);
    }

    public async run(args: ArgumentCollection): Promise<SubtagResult> {
        const context = args.context;

        const result: SubtagResult[] = [];
        const [varName, operator] = args.get(0, 2).select(n => bbtag.convert.toString(n));
        const [initial, limit] = args.get(1, 3).select(n => bbtag.convert.toNumber(n, NaN));
        const code = args.getRaw(args.length - 1)!;
        const increment = args.length === 5 ? 1 : bbtag.convert.toNumber(args.get(4), NaN);

        const nanValue = [[initial, 1], [limit, 3], [increment, 4]].find(x => isNaN(x[0]));
        if (nanValue !== undefined) {
            return validation.types.notNumber(args, args.getRaw(nanValue[1]));
        }

        // TODO: implement limits

        for (let i = initial; bool.check(i, operator, limit); i += increment) {
            await context.variables.set(varName, i);
            result.push(await context.execute(code));
            const next = bbtag.convert.tryToNumber(await context.variables.get(varName));
            if (!next.success) {
                result.push(validation.types.notNumber(args));
                break;
            }
            i = next.value;

            // TODO: Handle {return} subtag
        }

        context.variables.rollback(varName);
        return result.map(bbtag.convert.toString).join('');
    }
}

export default new ForSubtag();