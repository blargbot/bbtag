import { Awaitable, ISubtagToken, Subtag, SubtagResult } from '..';
import { ChannelType, IDiscordSubtagArgs } from '../discord';
import { BlargbotContext, BlargbotDMContext, BlargbotGuildContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotSubtagArgs extends IDiscordSubtagArgs {
    // TODO: define IBlargbotSubtagArgs
}

export class BlargbotSubtag<T extends BlargbotContext = BlargbotContext> extends Subtag<T> {
    protected constructor(args: IBlargbotSubtagArgs) {
        super(args);
    }
}

export class BlargbotGuildSubtag extends BlargbotSubtag<BlargbotGuildContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }

    public execute(token: ISubtagToken, context: BlargbotGuildContext): Awaitable<SubtagResult> {
        switch (context.message.channel.type) {
            case ChannelType.GuildNews:
            case ChannelType.GuildText:
                return super.execute(token, context);
            default:
                return context.error(token, 'Subtag only available inside a guild channel');
        }
    }
}

export class BlargbotDMSubtag extends BlargbotSubtag<BlargbotDMContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }

    public execute(token: ISubtagToken, context: BlargbotDMContext): Awaitable<SubtagResult> {
        switch (context.message.channel.type) {
            case ChannelType.DMGroup:
            case ChannelType.DMSingle:
                return super.execute(token, context);
            default:
                return context.error(token, 'Subtag only available inside a DM channel');
        }
    }
}