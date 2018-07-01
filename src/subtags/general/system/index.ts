import { SubTag } from '../util';
import { If } from './if';
import { Bool } from './bool';
import { Comment } from './comment';

export const subtags = [
    If,
    Bool,
    Comment,
] as Array<typeof SubTag>;