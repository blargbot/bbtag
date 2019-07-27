import { bbtag } from '../..';
import { SystemSubtag } from '../subtag';

export class ArgsArraySubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'argsarray',
            category: 'system',
            arguments: [],
            description: 'Gets user input as an array.',
            examples: [
                { code: 'Your input was {argsarray}', arguments: ['Hello', 'world!'], output: 'Your input was ["Hello","world!"]' }
            ]
        });

        this.whenArgs(0, args => args.context.arguments.slice())
            .default(bbtag.errors.tooManyArgs);
    }
}

export default new ArgsArraySubtag();