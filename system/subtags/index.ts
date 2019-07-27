import { SubtagCollection, SubtagContext } from '../../lib';

import args from './args';
import argsArray from './argsArray';
import argsLength from './argsLength';
import bool from './bool';
import comment from './comment';
import _for from './for';
import get from './get';
import _if from './if';
import lb from './lb';
import rb from './rb';
import semi from './semi';
import set from './set';
import zws from './zws';

export const subtags = new SubtagCollection(SubtagContext).register(
    args,
    argsArray,
    argsLength,
    comment,
    lb,
    rb,
    semi,
    zws,
    _if,
    bool,
    get,
    set,
    _for
);