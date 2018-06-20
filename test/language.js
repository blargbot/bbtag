"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const language = require("../dist/language");
const selection_1 = require("../dist/structures/selection");
describe('Language', () => {
    describe('#BBSource', () => {
        it('should construct from multiple lines', () => {
            // arrange
            let expected = ['this is a\n', 'test wooo\n', 'Hello there'];
            let input = expected.join('');
            // act
            let result = new language.BBSource(input);
            // assert
            chai_1.expect(result).to.be.instanceOf(language.BBSource);
            chai_1.expect(result.raw).to.be.equal(input);
            chai_1.expect(result.lines).to.be.deep.equal(expected);
        });
        it('should construct from a single line', () => {
            // arrange
            let expected = ['this is a test'];
            let input = expected.join('');
            // act
            let result = new language.BBSource(input);
            // assert
            chai_1.expect(result).to.be.instanceOf(language.BBSource);
            chai_1.expect(result.raw).to.be.equal(input);
            chai_1.expect(result.lines).to.be.deep.equal(expected);
        });
        it('should construct from an empty line', () => {
            // arrange
            let expected = [''];
            let input = expected.join('');
            // act
            let result = new language.BBSource(input);
            // assert
            chai_1.expect(result).to.be.instanceOf(language.BBSource);
            chai_1.expect(result.raw).to.be.equal(input);
            chai_1.expect(result.lines).to.be.deep.equal(expected);
        });
        it('should construct from empty lines', () => {
            // arrange
            let expected = ['\n', '\n', '\n', '\n', ''];
            let input = expected.join('');
            // act
            let result = new language.BBSource(input);
            // assert
            chai_1.expect(result).to.be.instanceOf(language.BBSource);
            chai_1.expect(result.raw).to.be.equal(input);
            chai_1.expect(result.lines).to.be.deep.equal(expected);
        });
    });
    describe('#getContent', () => {
        it('should get from range', () => {
            // arrange
            let lines = ['this is a\n', 'test wooo\n', 'Hello there'];
            let range = new selection_1.Range(new selection_1.Location(0, 4), new selection_1.Location(1, 5));
            // act
            let result = language.getContent(lines, range);
            // assert
            chai_1.expect(result).to.be.equal('is a\ntest');
        });
    });
    describe('#parse', () => {
        function toArray(bbstring) {
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
        function testParse(input, expected) {
            // act
            let result = language.parse(input);
            // assert
            chai_1.expect(result).not.to.be.null;
            chai_1.expect(result).to.be.instanceOf(language.BBString);
            chai_1.expect(toArray(result)).to.be.deep.equal(expected);
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
                ['is', 'a'],
                'test',
                [
                    'which',
                    ['is'],
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
            chai_1.expect(language.parse.bind(null, input)).to.throw(language.ParseError);
        });
        it('should fail when there is an unpaired { at the start', () => {
            // arrange
            let input = '{{this is a test}';
            // act & assert
            chai_1.expect(language.parse.bind(null, input)).to.throw(language.ParseError);
        });
        it('should fail when there is an unpaired { at the end', () => {
            // arrange
            let input = '{this is a test}{';
            // act & assert
            chai_1.expect(language.parse.bind(null, input)).to.throw(language.ParseError);
        });
        it('should fail when there is an unpaired }', () => {
            // arrange
            let input = '{this is} a test}';
            // act & assert
            chai_1.expect(language.parse.bind(null, input)).to.throw(language.ParseError);
        });
        it('should fail when there is an unpaired } at the start', () => {
            // arrange
            let input = '}{this is a test}';
            // act & assert
            chai_1.expect(language.parse.bind(null, input)).to.throw(language.ParseError);
        });
        it('should fail when there is an unpaired } at the end', () => {
            // arrange
            let input = '{this is a test}}';
            // act & assert
            chai_1.expect(language.parse.bind(null, input)).to.throw(language.ParseError);
        });
    });
});
