import { ExecutionContext, Subtag } from '../../models';
import comment from './comment';
import db from './db';
import lb from './lb';
import rb from './rb';
import semi from './semi';
import zws from './zws';

export default [
    comment,
    lb,
    rb,
    semi,
    zws,
    ...db
] as Array<Subtag<ExecutionContext>>;