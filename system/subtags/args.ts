import { argumentBuilder as A, ArgumentCollection, bbtag, SubtagResult } from '../../lib';
import { SystemSubtag } from '../subtag';

export class ArgsSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'args',
            category: 'system',
            arguments: [A.o('index'), A.o('range')],
            description:
                'Gets user input. Specifying `index` will only get the word at that location, specifying' +
                '`range` will get all the words between `index` and `range`. Specify `range` as `n` to get all' +
                'the words from `index` to the end',
            examples: [
                { code: 'Your second word was {args;1}', arguments: ['Hello', 'world!'], output: 'Your second word was world!' }
            ]
        });

        this.whenArgs(0, args => args.context.arguments.join(' '))
            .whenArgs('1,2', this.getArgs, true)
            .default(bbtag.errors.tooManyArgs);
    }

    public getArgs(args: ArgumentCollection): SubtagResult {
        const from = bbtag.convert.toNumber(args.get(0), NaN);
        const to = args.length === 1 ? from + 1 : bbtag.convert.toNumber(args.get(1), v => v === 'n' ? Infinity : NaN);

        if (isNaN(from)) { return bbtag.errors.types.notNumber(args, args.getRaw(0)); }
        if (isNaN(to)) { return bbtag.errors.types.notNumber(args, args.getRaw(1)); }

        if (from >= args.context.arguments.length) { return bbtag.errors.tooManyArgs(args, args.getRaw(0)); }

        if (Math.abs(from - to) === 1) {
            return args.context.arguments[Math.min(from, to)];
        }

        return args.context.arguments
            .slice(...[from, to].sort())
            .map(bbtag.convert.toString)
            .join(' ');
    }
}

export default new ArgsSubtag();