import { ExecutionContext, ISubtag } from '../../models';
import { default as comment } from './comment';
import { default as get } from './get';
import { default as set } from './set';
import { default as lb } from './lb';
import { default as rb } from './rb';
import { default as semi } from './semi';
import { default as zws } from './zws';
import { default as _if } from './if';
import { default as bool } from './bool';

export default [
    comment,
    lb,
    rb,
    semi,
    zws,
    _if,
    bool,
    get,
    set
] as Array<ISubtag<ExecutionContext>>;