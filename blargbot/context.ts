import { DiscordContext, DMMessage, GuildMessage, IDiscordContextArgs, Message } from '../discord';
import { Cloner, Engine, SubtagContext } from '../lib';
import { IBlargbot } from './types';

// tslint:disable-next-line: no-empty-interface
export interface IBlargbotContextArgs<T extends Message> extends IDiscordContextArgs<T> {
    readonly blargbot: IBlargbot;
}

export type BlargbotGuildContext = BlargbotContext<GuildMessage>;
export type BlargbotDMContext = BlargbotContext<DMMessage>;

export class BlargbotContext<T extends Message = Message> extends DiscordContext<T> {
    protected static clone<T extends Message>(parent: SubtagContext): BlargbotContext<T> {
        return parent instanceof BlargbotContext ? parent : undefined!;
    }

    public readonly blargbot: IBlargbot;

    // @ts-ignore
    private readonly ['__BlargbotContextDiscriminator__']: never;

    public constructor(engine: Engine<BlargbotContext<T>>, args: IBlargbotContextArgs<T>, ctor?: Cloner<SubtagContext, BlargbotContext>) {
        super(engine, args, ctor || BlargbotContext.clone);

        this.blargbot = args.blargbot;
    }
}