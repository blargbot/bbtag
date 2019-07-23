import { Snowflake } from './generic';

export function snowflake(source: string): Snowflake {
    if (isSnowflake(source)) {
        return source;
    }
    throw new Error('Invalid snowflake ' + source);
}

export function isSnowflake(source: string): source is Snowflake {
    try {
        const asBigint = BigInt(source);
        return BigInt.asUintN(64, asBigint) === asBigint;
    } catch {
        return false;
    }
}

export enum ChannelType {
    GuildText = 0,
    DMSingle = 1,
    GuildVoice = 2,
    DMGroup = 3,
    GuildCategory = 4,
    GuildNews = 5,
    GuildStore = 6
}

export enum MessageType {
    Default = 0,
    RecipientAdd = 1,
    RecipientRemove = 2,
    Call = 3,
    ChannelNameChange = 4,
    ChannelIconChange = 5,
    ChannelMessagePinned = 6,
    GuildMemberJoin = 7,
    UserPremiumSubscription = 8,
    UserPremiumSubscriptionTier1 = 9,
    UserPremiumSubscriptionTier2 = 10,
    UserPremiumSubscriptionTier3 = 11
}

export enum ActivityType {
    Game = 0,
    Streaming = 1,
    Listening = 2
}

export enum ModerationResult {
    Success = 0,
    ClientCannotModerate = 1,
    ClientCannotModerateHere = 2,
    UserCannotModerate = 3,
    UserCannotModerateHere = 4,
    Unknown = -1
}

export enum ModerationError {
    ClientCannotModerate = 1,
    ClientCannotModerateHere = 2,
    UserCannotModerate = 3,
    UserCannotModerateHere = 4,
    Unknown = -1
}

export enum AddReactionResult {
    Success = 0,
    ClientCannotAddReactions = 1,
    UnknownReaction = 2,
    ReactionLimitReached = 3,
    Unknown = -1
}

export enum RemoveReactionResult {
    Success = 0,
    ClientNotReacted = 1,
    UnknownReaction = 2,
    Unknown = -1
}