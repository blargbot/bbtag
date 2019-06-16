import { BBTag, Range, Position, SubtagToken, StringToken } from './models';
import { Enumerable, Enumerator } from './util/enumerable';

type stateTracker = { source: string, start: Position, end: Position };

export type postProcessor = (bbtag: BBTag) => BBTag;
export type preProcessor = (source: string) => string;

interface BBTagToken {
    range: Range;
    content: string;
}

export class Parser {
    public preProcessors: preProcessor[] = [];
    public postProcessors: postProcessor[] = [];

    public constructor() {
    }

    public parse(source: string): BBTag {
        let tokens = this.tokenize(this.preProcess(source)).getEnumerator();
        let root = this.createStringToken(tokens, true);
        return this.postProcess({ source, root });
    }


    protected tokenize(source: string): Enumerable<BBTagToken> {
        return Enumerable.from(_tokenize(source));
    }

    protected preProcess(source: string): string {
        for (const preProcessor of this.preProcessors) {
            source = preProcessor(source);
        }

        return source;
    }

    protected postProcess(bbtag: BBTag): BBTag {
        for (const postProcessor of this.postProcessors) {
            bbtag = postProcessor(bbtag) || bbtag;
        }

        return bbtag;
    }

    protected createStringToken(tokens: Enumerator<BBTagToken>, isTopLevel: boolean = false): StringToken {
        if (isTopLevel && !tokens.moveNext()) {
            throw new Error('No tokens found');
        }

        let start, end = start = tokens.current.range.start;
        let formatParts = [tokens.current.content];
        let subtags: SubtagToken[] = [];
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

        return removeComments({
            subtags,
            format: formatParts.join('').trim(),
            range: new Range(start, end)
        });
    }

    protected createSubtagToken(tokens: Enumerator<BBTagToken>): SubtagToken {
        let start = tokens.current.range.start;
        let closed = false;
        let parts = [];

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

function* _tokenize(source: string): IterableIterator<BBTagToken> {
    let states: stateTracker = { source, start: Position.initial, end: Position.initial };
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

function createToken(states: stateTracker): BBTagToken {
    let range = new Range(states.start, states.end);
    let content = range.slice(states.source);
    states.start = states.end;
    return { range, content };
}

function removeComments(stringToken: StringToken): StringToken {
    let replacements = [];
    let subtags = [];
    for (let i = 0; i < stringToken.subtags.length; i++) {
        let subtag = stringToken.subtags[i];
        removeComments(subtag.name);
        if (isCommentSubtag(subtag)) {
            replacements.push('');
        } else {
            replacements.push(`{${i}}`);
            subtags.push(subtag);
            for (const arg of subtag.args) {
                removeComments(arg);
            }
        }
    }

    return {
        subtags,
        format: stringToken.format.format(...replacements).trim(),
        range: stringToken.range
    }
}

function isCommentSubtag(subtagToken: SubtagToken): boolean {
    if (subtagToken.name.subtags.length !== 0) {
        return false;
    }
    return ['//', 'comment'].find(v => v === subtagToken.name.format) !== undefined;
}

function unmatchedOpen(): Error {
    return new Error('Unpaired \'{\'');
}

function unmatchedClosed(): Error {
    return new Error('Unpaired \'}\'');
}