import * as Channels from './channel';
import { ChannelType } from './instances';
import * as Messages from './message';

// tslint:disable-next-line: interface-over-type-literal
export type ChannelTypeMessageMap = {
    [ChannelType.GuildText]: Messages.IGuildTextChannelMessage;
    [ChannelType.DMSingle]: Messages.IDMSingleChannelMessage;
    [ChannelType.DMGroup]: Messages.IDMGroupChannelMessage;
    [ChannelType.GuildNews]: Messages.IGuildNewsChannelMessage;
};

// tslint:disable-next-line: interface-over-type-literal
export type ChannelTypeMap = {
    [ChannelType.GuildText]: Channels.IGuildTextChannel;
    [ChannelType.DMSingle]: Channels.IDMSingleChannel;
    [ChannelType.GuildVoice]: Channels.IGuildVoiceChannel;
    [ChannelType.DMGroup]: Channels.IDMGroupChannel;
    [ChannelType.GuildCategory]: Channels.IGuildCategoryChannel;
    [ChannelType.GuildNews]: Channels.IGuildNewsChannel;
    [ChannelType.GuildStore]: Channels.IGuildStoreChannel;
};