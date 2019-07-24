import { Snowflake } from './primitives';

export interface IEntity {
    readonly id: Snowflake;
}

type DefaultKey<T> = T extends { id: infer R } ? R : unknown;

export interface ICollection<TEntry, TKey = DefaultKey<TEntry>> extends Iterable<TEntry> {
    get(key: TKey): TEntry | undefined;
}