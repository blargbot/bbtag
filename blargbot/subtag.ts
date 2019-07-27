import { DiscordSubtagBase, IDiscordSubtagArgs } from '../discord';
import { Constructor } from '../lib';
import { BlargbotContext, BlargbotDMContext, BlargbotGuildContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotSubtagArgs<T extends BlargbotContext> extends IDiscordSubtagArgs<T> {
    // TODO: define IBlargbotSubtagArgs
}

export class BlargbotSubtagBase<T extends BlargbotContext> extends DiscordSubtagBase<T> {
    protected constructor(context: Constructor<T>, args: IBlargbotSubtagArgs<T>) {
        super(context, args);
    }
}

export class BlargbotSubtag extends BlargbotSubtagBase<BlargbotContext> {
    protected constructor(args: IBlargbotSubtagArgs<BlargbotContext>) {
        super(BlargbotContext, args);
    }
}

export class BlargbotGuildSubtag extends BlargbotSubtagBase<BlargbotGuildContext> {
    protected constructor(args: IBlargbotSubtagArgs<BlargbotGuildContext>) {
        super(BlargbotContext, args);
    }
}

export class BlargbotDMSubtag extends BlargbotSubtagBase<BlargbotDMContext> {
    protected constructor(args: IBlargbotSubtagArgs<BlargbotDMContext>) {
        super(BlargbotContext, args);
    }
}