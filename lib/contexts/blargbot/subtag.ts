import { ChannelType } from '../../../external/discord';
import { ISubtagToken, SubtagResult } from '../../language';
import { Subtag } from '../../structures';
import { Awaitable } from '../../util';
import { IDiscordSubtagArgs } from '../discord';
import { BlargbotContext, DMContext, GuildContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotSubtagArgs extends IDiscordSubtagArgs {
    // TODO: define IBlargbotSubtagArgs
}

export class BlargbotSubtag<T extends BlargbotContext = BlargbotContext> extends Subtag<T> {
    protected constructor(args: IBlargbotSubtagArgs) {
        super(args);
    }
}

export class BlargbotGuildSubtag extends BlargbotSubtag<GuildContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }

    public execute(token: ISubtagToken, context: GuildContext): Awaitable<SubtagResult> {
        switch (context.message.channel.type) {
            case ChannelType.GuildNews:
            case ChannelType.GuildText:
                return super.execute(token, context);
            default:
                return context.error(token, 'Subtag only available inside a guild channel');
        }
    }
}

export class BlargbotDMSubtag extends BlargbotSubtag<DMContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }

    public execute(token: ISubtagToken, context: DMContext): Awaitable<SubtagResult> {
        switch (context.message.channel.type) {
            case ChannelType.DMGroup:
            case ChannelType.DMSingle:
                return super.execute(token, context);
            default:
                return context.error(token, 'Subtag only available inside a DM channel');
        }
    }
}