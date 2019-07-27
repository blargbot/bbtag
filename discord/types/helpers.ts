import { Enumerable } from '../../lib';
import { Channel, DMChannel, GuildChannel } from './channel';
import { ChannelType } from './instances';
import { DMMessage, GuildMessage, Message } from './message';

function keysOf<T>(instance: T): Array<keyof T> {
    return Object.keys(instance) as Array<keyof T>;
}

const DM = Enumerable.from([ChannelType.DMGroup, ChannelType.DMSingle]);
const Guild = Enumerable.from(keysOf(ChannelType)).select(k => ChannelType[k]).except(DM).cache();

export const discord = {
    isGuildChannel(channel: Channel): channel is GuildChannel { return Guild.contains(channel.type); },
    isDMChannel(channel: Channel): channel is DMChannel { return DM.contains(channel.type); },
    isGuildMessage(message: Message): message is GuildMessage { return Guild.contains(message.channel.type); },
    isDMMessage(message: Message): message is DMMessage { return DM.contains(message.channel.type); }
};

export default discord;