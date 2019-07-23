import { ChannelType, DMMessage, GuildMessage } from '../../external';
import { ISubtagToken, SubtagResult } from '../../language';
import { Subtag } from '../../structures';
import { Awaitable } from '../../util';
import { ISystemSubtagArgs } from '../system';
import { DiscordContext } from './context';

// tslint:disable-next-line: no-empty-interface
export interface IDiscordSubtagArgs extends ISystemSubtagArgs {
    // TODO: define IDiscordSubtagArgs
}

export class DiscordSubtag<T extends DiscordContext = DiscordContext> extends Subtag<T> {
    protected constructor(args: IDiscordSubtagArgs) {
        super(args);
    }
}

type GuildContext = DiscordContext & { message: GuildMessage };

export class GuildSubtag extends DiscordSubtag<GuildContext> {
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

type DMContext = DiscordContext & { message: DMMessage };

export class DMSubtag extends DiscordSubtag<DMContext> {
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