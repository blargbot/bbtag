import { bbtag, SubtagResult } from '../../language';
import { argumentBuilder as A, ArgumentCollection, validation } from '../../structures';
import { BasicSubtag } from '../abstract/basicSubtag';
import { default as bool } from './bool';

export class ForSubtag extends BasicSubtag {
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
        const notNumber = () => validation.throw.types.notNumber(args);

        let result = '';
        const [varName, operator] = args.get(0, 2).select(n => bbtag.toString(n));
        const [initial, limit] = args.get(1, 3).select(n => bbtag.toNumber(n, notNumber));
        const code = args.getRaw(args.length - 1)!;
        const increment = args.length === 5 ? 1 : bbtag.toNumber(args.get(4), notNumber);

        // TODO: implement limits

        for (let i = initial; bool.check(i, operator, limit); i += increment) {
            await context.variables.set(varName, i);
            result += bbtag.toString(await context.execute(code));
            const next = bbtag.tryToNumber(await context.variables.get(varName));
            if (!next.success) {
                bbtag.toString(validation.types.notNumber(args));
                break;
            }
            i = next.value;

            if (context.state.return) {
                break;
            }
        }

        context.variables.rollback(varName);
        return result;
    }
}