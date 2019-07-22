import { ISubtagOptions, Subtag } from '../../structures';
import { BlargbotContext } from './context';

export class BlargbotSubtag extends Subtag<BlargbotContext> {
    protected constructor(args: Omit<ISubtagOptions<BlargbotContext>, 'contextType'>) {
        super({
            ...args,
            contextType: BlargbotContext
        });
    }
}