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

// Reference: https://discordapp.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
export enum Permission {
    CREATE_INSTANT_INVITE = 0x00000001,
    KICK_MEMBERS = 0x00000002,
    BAN_MEMBERS = 0x00000004,
    ADMINISTRATOR = 0x00000008,
    MANAGE_CHANNELS = 0x00000010,
    MANAGE_GUILD = 0x00000020,
    ADD_REACTIONS = 0x00000040,
    VIEW_AUDIT_LOG = 0x00000080,
    VIEW_CHANNEL = 0x00000400,
    SEND_MESSAGES = 0x00000800,
    SEND_TTS_MESSAGES = 0x00001000,
    MANAGE_MESSAGES = 0x00002000,
    EMBED_LINKS = 0x00004000,
    ATTACH_FILES = 0x00008000,
    READ_MESSAGE_HISTORY = 0x00010000,
    MENTION_EVERYONE = 0x00020000,
    USE_EXTERNAL_EMOJIS = 0x00040000,
    CONNECT = 0x00100000,
    SPEAK = 0x00200000,
    MUTE_MEMBERS = 0x00400000,
    DEAFEN_MEMBERS = 0x00800000,
    MOVE_MEMBERS = 0x01000000,
    USE_VAD = 0x02000000,
    PRIORITY_SPEAKER = 0x00000100,
    CHANGE_NICKNAME = 0x04000000,
    MANAGE_NICKNAMES = 0x08000000,
    MANAGE_ROLES = 0x10000000,
    MANAGE_WEBHOOKS = 0x20000000,
    MANAGE_EMOJIS = 0x40000000
}