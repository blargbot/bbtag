import { functions } from '../util';
import getType from './getType';
import { SubtagResult, SwitchHandlers } from './types';

export function switchType<T>(target: SubtagResult, handlers: Required<SwitchHandlers<T>>): T;
export function switchType<T>(target: SubtagResult, handlers: SwitchHandlers<T>): T | undefined;
export function switchType<T, R = T>(target: SubtagResult, handlers: SwitchHandlers<T>, defaultCase: (value: SubtagResult) => R): T | R;
export function switchType(target: SubtagResult, handlers: SwitchHandlers<any>, defaultCase: (value: SubtagResult) => any = functions.blank): any {
    const handler = (handlers[getType(target)] || defaultCase) as (v: SubtagResult) => any;
    return handler(target);
}

export default switchType;