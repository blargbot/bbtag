import { ExecutionContext, Subtag } from '../../models';
import { default as comment } from './comment';
import { default as db } from './db';
import { default as lb } from './lb';
import { default as rb } from './rb';
import { default as semi } from './semi';
import { default as zws } from './zws';
import { default as _if } from './if';

export default [
    comment,
    lb,
    rb,
    semi,
    zws,
    _if,
    ...db
] as Array<Subtag<ExecutionContext>>;