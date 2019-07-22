import { Subtag } from '../../structures';
import { IDiscordSubtagArgs } from '../discord';
import { BlargbotContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotSubtagArgs extends IDiscordSubtagArgs {
    // TODO: define IBlargbotSubtagArgs
}

export class BlargbotSubtag extends Subtag<BlargbotContext> {
    protected constructor(args: IBlargbotSubtagArgs) {
        super({
            ...args,
            contextType: BlargbotContext
        });
    }
}