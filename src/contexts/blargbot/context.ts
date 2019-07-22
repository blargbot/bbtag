import { BBTagEngine } from '../../engine';
import { Context as DiscordContext, IDiscordContextArgs } from '../discord';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotContextArgs extends IDiscordContextArgs {
    // TODO define IBlargbotContextArgs
}

export class BlargbotContext extends DiscordContext {
    public readonly type!: typeof BlargbotContext;

    public readonly discrim3!: number; // TODO Remove this as it is temporary to force clashes between the context types

    public constructor(engine: BBTagEngine<typeof BlargbotContext>, args: IBlargbotContextArgs) {
        super(engine, args);
    }
}