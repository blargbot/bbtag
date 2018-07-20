import { expect } from 'chai';
import * as language from '../dist/language';
import { Range, Location } from '../dist/structures/selection';

describe('Language', () => {
    describe('#BBSource', () => {
        it('should construct from multiple lines', () => {
            // arrange
            let expected = ['this is a\n', 'test wooo\n', 'Hello there'];
            let input = expected.join('');

            // act
            let result = new language.BBSource(input);

            // assert
            expect(result).to.be.instanceOf(language.BBSource);
            expect(result.raw).to.be.equal(input);
            expect(result.lines).to.be.deep.equal(expected);
        });
        it('should construct from a single line', () => {
            // arrange
            let expected = ['this is a test'];
            let input = expected.join('');

            // act
            let result = new language.BBSource(input);

            // assert
            expect(result).to.be.instanceOf(language.BBSource);
            expect(result.raw).to.be.equal(input);
            expect(result.lines).to.be.deep.equal(expected);
        });
        it('should construct from an empty line', () => {
            // arrange
            let expected = [''];
            let input = expected.join('');

            // act
            let result = new language.BBSource(input);

            // assert
            expect(result).to.be.instanceOf(language.BBSource);
            expect(result.raw).to.be.equal(input);
            expect(result.lines).to.be.deep.equal(expected);
        });
        it('should construct from empty lines', () => {
            // arrange
            let expected = ['\n', '\n', '\n', '\n', ''];
            let input = expected.join('');

            // act
            let result = new language.BBSource(input);

            // assert
            expect(result).to.be.instanceOf(language.BBSource);
            expect(result.raw).to.be.equal(input);
            expect(result.lines).to.be.deep.equal(expected);
        });
    });
    describe('#getContent()', () => {
        it('should get from range', () => {
            // arrange
            let lines = ['this is a\n', 'test wooo\n', 'Hello there'];
            let range = new Range(new Location(0, 4), new Location(1, 5));

            // act
            let result = language.getContent(lines, range);

            // assert
            expect(result).to.be.equal('is a\ntest');
        });
    });
    describe('#parse()', () => {
        function toArray(bbstring: language.BBString): bbarray {
            return bbstring.parts.map(function (part) {
                if (typeof part === 'string')
                    return part;
                let children = [];
                if (part.name !== undefined)
                    children.push(part.name);
                children.push(...part.args);
                return children.map(toArray).reduce((p, c) => (p.push(...c), p), []);
            });
        }
        function testParse(input: string, expected: bbarray) {
            // act
            let result = language.parse(input);

            // assert
            expect(result).not.to.be.null;
            expect(result).to.be.instanceOf(language.BBString);
            expect(toArray(result)).to.be.deep.equal(expected);
        }
        it('should successfully parse a plain string', () => {
            // arrange
            let expected = ['this is a; test'];
            let input = expected.join('');

            // act & assert
            testParse(input, expected);
        });
        it('should successfully parse a normal tag', () => {
            // arrange
            let expected = [
                'this',
                ['is', 'a'], // Subtag
                'test',
                [ // Subtag
                    'which',
                    ['is'], // SubTag
                    'really'
                ],
                'complicated'
            ];
            let input = 'this {is;a} test {which;{is};really} complicated';

            // act & assert
            testParse(input, expected);
        });
        it('should successfully parse an empty subtag', () => {
            // arrange
            let expected = ['hmm', [''], 'test'];
            let input = 'hmm{}test';

            // act & assert
            testParse(input, expected);
        });
        it('should successfully parse when starting with a subtag', () => {
            // arrange
            let expected = [['this', 'is'], 'a test'];
            let input = '{this;is} a test';

            // act & assert
            testParse(input, expected);
        });
        it('should successfully parse when ending with a subtag', () => {
            // arrange
            let expected = ['this is', ['a', 'test']];
            let input = 'this is {a;test}';

            // act & assert
            testParse(input, expected);
        });
        it('should fail when there is an unpaired {', () => {
            // arrange
            let input = '{this {is a test}';

            // act & assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:1]: Unpaired \'{\'');
        });
        it('should fail when there is an unpaired { at the start', () => {
            // arrange
            let input = '{{this is a test}';

            // act & assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:1]: Unpaired \'{\'');
        });
        it('should fail when there is an unpaired { at the end', () => {
            // arrange
            let input = '{this is a test}{';

            // act & assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:17]: Unpaired \'{\'');
        });
        it('should fail when there is an unpaired }', () => {
            // arrange
            let input = '{this is} a test}';

            // act & assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:17]: Unexpected \'}\'');
        });
        it('should fail when there is an unpaired } at the start', () => {
            // arrange
            let input = '}{this is a test}';

            // act & assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:1]: Unexpected \'}\'');
        });
        it('should fail when there is an unpaired } at the end', () => {
            // arrange
            let input = '{this is a test}}';

            // act & assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:17]: Unexpected \'}\'');
        });
        it('should fail when named args are used with normal args', () => {
            // arrange
            let input = '{this=is;a;test}';

            // act && assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:1]: Cannot use \';\' when using named arguments');
        });
        it('should fail when key-value pairs have more than 1 arg', () => {
            // arrange
            let input = '{*this;is;a;test}';

            // act && assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:1]: Key-Values must have exactly 1 argument');
        });
        it('should fail when key-value pairs have less than 1 arg', () => {
            // arrange
            let input = '{*this is a test}';

            // act && assert
            expect(language.parse.bind(null, input)).to.throw(language.ParseError, '[1:1]: Key-Values must have exactly 1 argument');
        });
    })
});

interface bbarray extends Array<bbarray | string> { }