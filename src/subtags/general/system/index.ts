import { SubTag } from '../util';
import { If } from './if';
import { Bool } from './bool';
import { Comment } from './comment';
import { Switch } from './switch';

export const subtags = [
    If,
    Bool,
    Comment,
    Switch
] as Array<typeof SubTag>;