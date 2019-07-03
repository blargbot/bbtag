import { IBBTag, IStringToken, ISubtagToken, Position, Range } from './structures';
import { Enumerable, Enumerator } from './util/enumerable';

interface IStateTracker { source: string; start: Position; end: Position; }

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
    const states: IStateTracker = { source, start: Position.initial, end: Position.initial };
    for (const char of source) {
        switch (char) {
            case '\n':
                states.end = states.end.nextLine();
                break;
            case '{':
            case ';':
            case '}':
                yield createToken(states);
                states.end = states.end.nextColumn();
                yield createToken(states);
                break;
            default:
                states.end = states.end.nextColumn();
                break;
        }
    }
    yield createToken(states);
}

function createToken(states: IStateTracker): IBBTagToken {
    const range = new Range(states.start, states.end);
    const content = states.source.slice(range.start.offset, range.end.offset);
    states.start = states.end;
    return { range, content };
}

function unmatchedOpen(): Error {
    return new Error('Unpaired \'{\'');
}

function unmatchedClosed(): Error {
    return new Error('Unpaired \'}\'');
}