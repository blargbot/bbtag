import { Cursor, Enumerator, Position, Range, TokenRange } from '../util';
import { IStringToken, ISubtagToken } from './types';

interface IStateTracker { cursor: Cursor; lastYield: Position; }

interface IToken {
    range: Range;
    content: string;
}

export type BBTagParser = (source: string) => IStringToken;

export function parse(source: string): IStringToken {
    const tokens = new Enumerator(createTokenStream(source));
    const result = readStringToken(tokens, true);
    if (tokens.moveNext()) {
        throw new Error('Unpaired \'}\'');
    }
    return result;
}

function* createTokenStream(source: string): Iterator<IToken> {
    const state = { cursor: new Cursor(source), lastYield: new Position(0, 0, 0) };
    do {
        switch (state.cursor.nextChar) {
            case '{':
            case ';':
            case '}':
                yield createToken(state);
                state.cursor.move(1);
                yield createToken(state);
                break;
            case undefined:
                yield createToken(state);
                return;
            default:
                state.cursor.move(1);
                break;
        }
    } while (true);
}

function createToken(state: IStateTracker): IToken {
    const content = state.cursor.source.slice(state.lastYield.offset, state.cursor.offset);
    const range = new Range(state.lastYield, state.cursor.position);
    state.lastYield = state.cursor.position;
    return { range, content };
}

function readStringToken(tokenStream: Enumerator<IToken>, ignoreSemi: boolean = false): IStringToken {
    tokenStream.moveNext();

    let end = tokenStream.current.range.start;
    const start = tokenStream.current.range.start;
    const formatParts = [tokenStream.current.content];
    const subtags: ISubtagToken[] = [];

    whileLoop:
    while (tokenStream.moveNext()) {
        switch (tokenStream.current.content) {
            case '{':
                formatParts.push(`{${subtags.length}}`);
                subtags.push(readSubtagToken(tokenStream));
                break;
            case '}':
            case ignoreSemi || ';':
                break whileLoop;
            default:
                formatParts.push(tokenStream.current.content);
        }
        end = tokenStream.current.range.end;
    }

    return {
        subtags,
        format: formatParts.join('').trim(),
        range: TokenRange.from(start, end)
    };
}

function readSubtagToken(tokenStream: Enumerator<IToken>): ISubtagToken {
    const start = tokenStream.current.range.start;
    const parts = [];

    while (tokenStream.current.content !== undefined) {
        parts.push(readStringToken(tokenStream));
        if (tokenStream.current === undefined) {
            break;
        }
        if (tokenStream.current.content === '}') {
            return {
                name: parts[0],
                args: parts.slice(1),
                range: TokenRange.from(start, tokenStream.current.range.end)
            };
        }
    }

    throw new Error('Unpaired \'{\'');
}