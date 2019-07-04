import { IBBTag, IStringToken, ISubtagToken, Position, Range } from './structures';
import { Cursor } from './structures/cursor';
import { Enumerable, Enumerator } from './util/enumerable';

interface IStateTracker { cursor: Cursor; lastYield: Position; }

export type postProcessor = (bbtag: IBBTag) => IBBTag;
export type preProcessor = (source: string) => string;

interface IBBTagToken {
    range: Range;
    content: string;
}

export class Parser {
    public parse(source: string): IStringToken {
        const tokens = this.tokenize(source).getEnumerator();
        const root = this.createStringToken(tokens, true);
        return root;
    }

    protected tokenize(source: string): Enumerable<IBBTagToken> {
        return Enumerable.from(_tokenize(source));
    }

    protected createStringToken(tokens: Enumerator<IBBTagToken>, isTopLevel: boolean = false): IStringToken {
        if (isTopLevel && !tokens.moveNext()) {
            throw new Error('No tokens found');
        }

        let start;
        let end = start = tokens.current.range.start;
        const formatParts = [tokens.current.content];
        const subtags: ISubtagToken[] = [];
        let index = 0;

        whileLoop:
        while (tokens.moveNext()) {
            switch (tokens.current.content) {
                case '{':
                    subtags.push(this.createSubtagToken(tokens));
                    formatParts.push(`{${index++}}`);
                    break;
                case ';':
                    if (isTopLevel) {
                        formatParts.push(tokens.current.content);
                        break;
                    }
                case '}':
                    if (isTopLevel) {
                        throw unmatchedClosed();
                    }
                    break whileLoop;
                default:
                    formatParts.push(tokens.current.content);
                    break;
            }
            end = tokens.current.range.end;
        }

        return {
            subtags,
            format: formatParts.join('').trim(),
            range: new Range(start, end)
        };
    }

    protected createSubtagToken(tokens: Enumerator<IBBTagToken>): ISubtagToken {
        const start = tokens.current.range.start;
        let closed = false;
        const parts = [];

        while (tokens.moveNext()) {
            parts.push(this.createStringToken(tokens));
            if (tokens.current === undefined) {
                break;
            }
            if (tokens.current.content === '}') {
                closed = true;
                break;
            }
        }

        if (!closed) {
            throw unmatchedOpen();
        }

        return {
            name: parts[0],
            args: parts.slice(1),
            range: new Range(start, tokens.current.range.end)
        };
    }
}

function* _tokenize(source: string): IterableIterator<IBBTagToken> {
    const state = { cursor: new Cursor(source), lastYield: new Position(0, 0, 0) };
    whileLoop:                               // '[' = lastYield; ']' = cursor;
    while (true) {                           // initial state: '[]abc;xyz'
        switch (state.cursor.nextChar) {
            case '{':
            case ';':
            case '}':
                yield createToken(state);    // '[abc];xyz' => 'abc[];xyz' + { content: 'abc' }
                state.cursor.move(1);        // 'abc[];xyz' => 'abc[;]xyz'
                yield createToken(state);    // 'abc[;]xyz' => 'abc;[]xyz' + { content: ';'   }
                break;
            default:
                if (!state.cursor.move(1)) { // 'abc;[xyz]' => cant move
                    break whileLoop;
                }
        }
    }
    yield createToken(state);                // 'abc;[xyz]' => 'abc;xyz[]' + { content: 'xyz' }
    // Final yielded values:
    // 'abc;xyz' => [{ content: 'abc' }, { content: ';' }, { content: 'xyz' }]
}

function createToken(state: IStateTracker): IBBTagToken {
    const content = state.cursor.source.slice(state.lastYield.offset, state.cursor.offset);
    const range = new Range(state.lastYield, state.cursor.position);
    state.lastYield = state.cursor.position;
    return { range, content };
}

function unmatchedOpen(): Error {
    return new Error('Unpaired \'{\'');
}

function unmatchedClosed(): Error {
    return new Error('Unpaired \'}\'');
}