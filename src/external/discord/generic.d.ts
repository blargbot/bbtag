export type Snowflake = string & { __value__: never };
export type Color = number;
export type Permissions = number;

export interface IEntity {
    readonly id: Snowflake;
}

type DefaultKey<T> = T extends { id: infer R } ? R : unknown;

export interface ICollection<TEntry, TKey = DefaultKey<TEntry>> extends Iterable<TEntry> {
    get(key: TKey): TEntry | undefined;
}