import { Awaitable, Constructor, ISubtagToken, SubtagResult } from '..';
import { ISystemSubtagArgs, SystemSubtagBase } from '../system';
import { DiscordContext, DiscordDMContext, DiscordGuildContext } from './context';
import { ChannelType } from './types';

// tslint:disable-next-line: no-empty-interface
export interface IDiscordSubtagArgs<T extends DiscordContext> extends ISystemSubtagArgs<T> {
    // TODO: define IDiscordSubtagArgs
}

export class DiscordSubtagBase<T extends DiscordContext> extends SystemSubtagBase<T> {
    protected constructor(context: Constructor<T>, args: IDiscordSubtagArgs<T>) {
        super(context, args);
    }
}

export class DiscordSubtag extends DiscordSubtagBase<DiscordContext> {
    public constructor(args: ISystemSubtagArgs<DiscordContext>) {
        super(DiscordContext, args);
    }
}

export class DiscordGuildSubtag extends DiscordSubtagBase<DiscordGuildContext> {
    protected constructor(args: IDiscordSubtagArgs<DiscordGuildContext>) {
        super(DiscordContext, args);
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

export class DiscordDMSubtag extends DiscordSubtagBase<DiscordDMContext> {
    protected constructor(args: IDiscordSubtagArgs<DiscordDMContext>) {
        super(DiscordContext, args);
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