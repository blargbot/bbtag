import { Awaitable, ISubtagToken, SubtagResult } from '..';
import { ISystemSubtagArgs, SystemSubtag } from '../system';
import { DiscordContext, DiscordDMContext, DiscordGuildContext } from './context';
import { ChannelType } from './types';

// tslint:disable-next-line: no-empty-interface
export interface IDiscordSubtagArgs<T extends DiscordContext = DiscordContext> extends ISystemSubtagArgs<T> {
    // TODO: define IDiscordSubtagArgs
}

export class DiscordSubtag<T extends DiscordContext = DiscordContext> extends SystemSubtag<T> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }
}

export class GuildSubtag extends DiscordSubtag<DiscordGuildContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }

    public execute(token: ISubtagToken, context: DiscordGuildContext): Awaitable<SubtagResult> {
        switch (context.message.channel.type) {
            case ChannelType.GuildNews:
            case ChannelType.GuildText:
                return super.execute(token, context);
            default:
                return context.error(token, 'Subtag only available inside a guild channel');
        }
    }
}

export class DMSubtag extends DiscordSubtag<DiscordDMContext> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }

    public execute(token: ISubtagToken, context: DiscordDMContext): Awaitable<SubtagResult> {
        switch (context.message.channel.type) {
            case ChannelType.DMGroup:
            case ChannelType.DMSingle:
                return super.execute(token, context);
            default:
                return context.error(token, 'Subtag only available inside a DM channel');
        }
    }
}