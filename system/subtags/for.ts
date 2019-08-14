import { ArgumentCollection, bbUtil, SubtagResult } from '../../lib';
import { SystemSubtag } from '../subtag';
import { BoolSubtag } from './bool';

export class ForSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'for',
            category: 'system',
            arguments: a => [a.r('variable'), a.r('initial'), a.r('comparison'), a.r('limit'), a.o('increment'), a.r('code')],
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

        this.whenArgs('0-4', bbUtil.errors.notEnoughArgs)
            .whenArgs('5', this.run, [0, 1, 2, 3])
            .whenArgs('6', this.run, [0, 1, 2, 3, 4])
            .default(bbUtil.errors.tooManyArgs);
    }

    public async run(args: ArgumentCollection): Promise<SubtagResult> {
        const bool = args.context.subtags.find('bool', BoolSubtag)
            || bbUtil.errors.throw.system.unknownSubtag(args, 'bool');
        const result: SubtagResult[] = [];
        const [varName, operator] = args.get(0, 2).select(n => bbUtil.convert.toString(n));
        const [initial, limit] = args.get(1, 3).select(n => bbUtil.convert.toNumber(n, NaN));
        const code = args.getRaw(args.length - 1)!;
        const increment = args.length === 5 ? 1 : bbUtil.convert.toNumber(args.get(4), NaN);

        const nanIndex = [0, initial, 0, limit, increment].findIndex(isNaN);
        if (nanIndex !== -1) {
            return bbUtil.errors.types.notNumber(args, args.getRaw(nanIndex));
        }

        // TODO: implement limits

        for (let i = initial; bool.check(i, operator, limit); i += increment) {
            await args.context.variables.set(varName, i);
            result.push(await args.context.execute(code));
            const next = bbUtil.convert.tryToNumber(await args.context.variables.get(varName));
            if (!next.success) {
                result.push(bbUtil.errors.types.notNumber(args));
                break;
            }
            i = next.value;

            if (args.context.isTerminated) { break; }
        }

        args.context.variables.rollback(varName);
        return result.map(bbUtil.convert.toString).join('');
    }
}

export default new ForSubtag();