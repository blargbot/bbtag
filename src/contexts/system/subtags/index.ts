import { ISubtag } from '../../../structures';
import { SystemContext } from '../context';

import { default as bool } from './bool';
import { default as comment } from './comment';
import { default as get } from './get';
import { default as _if } from './if';
import { default as lb } from './lb';
import { default as rb } from './rb';
import { default as semi } from './semi';
import { default as set } from './set';
import { default as zws } from './zws';

export const subtags: Array<ISubtag<SystemContext>> = [
    comment,
    lb,
    rb,
    semi,
    zws,
    _if,
    bool,
    get,
    set
];