import { ExecutionContext, Subtag } from '../../models';
import comment from './comment';
import db from './db';
import lb from './lb';
import rb from './rb';
import semi from './semi';
import zws from './zws';
import _if from './if';

export default [
    comment,
    lb,
    rb,
    semi,
    zws,
    _if,
    ...db
] as Array<Subtag<ExecutionContext>>;