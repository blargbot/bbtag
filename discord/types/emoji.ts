import { Snowflake } from './primitives';

export type ReactionEmoji = IStandardEmoji | ICustomEmoji;

export interface IReaction {
    readonly count: number;
    readonly me: boolean;
    readonly emoji: ReactionEmoji;
}

export interface IStandardEmoji extends IEmoji {
    readonly id: undefined;
    readonly name: string;
}

export interface ICustomEmoji extends IEmoji {
    readonly id: Snowflake;
    readonly name: string;
}

export interface IEmoji {
    readonly id?: Snowflake;
    readonly name: string;
}