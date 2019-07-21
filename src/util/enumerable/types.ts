import { Enumerable } from '.';

export type selectorFunc<TSource, TResult> = (element: TSource, index: number) => TResult;
export type comparerFunc<TSource> = (left: TSource, right: TSource) => number;
export type predicateFunc<TSource> = (element: TSource, index: number) => boolean;
export type predicateIsFunc<TSource, TChild extends TSource> = (element: TSource, index: number) => element is TChild;
export type EnumerableSource<T> = T[] | ArrayLike<T> | string | Set<T> | Iterable<T> | Enumerable<any>;