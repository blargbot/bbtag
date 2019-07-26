import { Engine } from '..';
import { DiscordContext, DMMessage, GuildMessage, IDefaultMessage, IDiscordContextArgs } from '../discord';
import { IBlargbot } from './types';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotContextArgs<T extends IDefaultMessage> extends IDiscordContextArgs<T> {
    readonly blargbot: IBlargbot;
}

export type BlargbotGuildContext = BlargbotContext<GuildMessage>;
export type BlargbotDMContext = BlargbotContext<DMMessage>;

export class BlargbotContext<T extends IDefaultMessage = IDefaultMessage> extends DiscordContext<T> {
    public readonly type!: typeof BlargbotContext;
    public readonly blargbot: IBlargbot;

    // @ts-ignore
    private readonly ['__BlargbotContextDiscriminator__']: undefined;

    public constructor(engine: Engine<BlargbotContext<T>>, args: IBlargbotContextArgs<T>) {
        super(engine, args);

        this.blargbot = args.blargbot;
    }
}