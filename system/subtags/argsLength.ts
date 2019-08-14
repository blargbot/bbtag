import { bbtag } from '../../lib';
import { SystemSubtag } from '../subtag';

export class ArgsLengthSubtag extends SystemSubtag {
    public constructor() {
        super({
            name: 'argslength',
            category: 'system',
            arguments: [],
            description: 'Return the number of arguments the user provided.',
            examples: [
                { code: 'You said {argslength} words.', arguments: ['I', 'am', 'saying', 'things.'], output: 'You said 4 words.' }
            ]
        });

        this.whenArgs(0, args => args.context.arguments.length)
            .default(bbtag.errors.tooManyArgs);
    }
}

export default new ArgsLengthSubtag();