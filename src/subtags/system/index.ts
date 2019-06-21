import { default as comment } from './comment';
import { default as lb } from './lb';
import { default as rb } from './rb';
import { default as semi } from './semi';
import { default as zws } from './zws';
import { default as db } from './db';
import { Subtag, ExecutionContext } from '../../models';

export default [
    comment,
    lb,
    rb,
    semi,
    zws,
    ...db
] as Subtag<ExecutionContext>[];