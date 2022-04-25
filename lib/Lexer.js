"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexerIterator = exports.NumberToken = exports.Token = exports.TokenType = void 0;
function isWhiteSpace(character) {
    return character === ' ' || character === '\t';
}
function isNumeric(character) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(character);
}
function isAlphabetic(character) {
    return [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
    ].includes(character);
}
function isAlphaNumeric(character) {
    return isAlphabetic(character) || isNumeric(character);
}
var TokenType;
(function (TokenType) {
    TokenType[TokenType["COMMA"] = 100] = "COMMA";
    TokenType[TokenType["FullStop"] = 101] = "FullStop";
    // Literals
    TokenType[TokenType["NUMBER"] = 102] = "NUMBER";
    TokenType[TokenType["STRING"] = 103] = "STRING";
    // KeyPhrases
    TokenType[TokenType["ADD"] = 0] = "ADD";
    TokenType[TokenType["SUBTRACT"] = 1] = "SUBTRACT";
    TokenType[TokenType["MULTIPLY"] = 2] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 3] = "DIVIDE";
    // Other
    TokenType[TokenType["EOF"] = 104] = "EOF";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var KeyPhrases = [
    ['plus'],
    ['minus'],
    ['times', 'multiplied by'],
    ['divided by'],
];
var Token = /** @class */ (function () {
    function Token(type, value, position) {
        this.type = type;
        this.value = value;
        this.position = position;
    }
    return Token;
}());
exports.Token = Token;
var NumberToken = /** @class */ (function (_super) {
    __extends(NumberToken, _super);
    function NumberToken(type, number, position) {
        var _this = _super.call(this, TokenType.NUMBER, number.toString(), position) || this;
        _this.type = type;
        _this.number = number;
        _this.position = position;
        return _this;
    }
    return NumberToken;
}(Token));
exports.NumberToken = NumberToken;
var LexerIterator = /** @class */ (function () {
    function LexerIterator(input) {
        this.position = { line: 1, column: 0, machine: -1 };
        this.current = null;
        //@ts-expect-error
        this.index = 0;
        this.done = false;
        this.input = input.split('');
        this.advance();
    }
    LexerIterator.prototype.advance = function () {
        this.position.machine++;
        this.position.column++;
        if (this.position.machine > this.input.length - 1) {
            this.current = null; // Indicates end of input
        }
        else {
            this.current = this.input[this.position.machine];
        }
    };
    LexerIterator.prototype.skipWhiteSpace = function () {
        while (this.current && isWhiteSpace(this.current)) {
            this.advance();
        }
    };
    LexerIterator.prototype.skipComment = function () {
        while (this.current && this.current !== ')') {
            this.advance();
        }
        this.advance();
    };
    LexerIterator.prototype.number = function () {
        var result = '';
        while (this.current && isNumeric(this.current)) {
            result += this.current;
            this.advance();
        }
        if (this.current == '.') {
            result += '.';
            this.advance();
            while (this.current && isNumeric(this.current)) {
                result += this.current;
                this.advance();
            }
        }
        return Number(result);
    };
    LexerIterator.prototype.string = function () {
        var result = '';
        while (this.current && isAlphaNumeric(this.current)) {
            result += this.current;
            this.advance();
        }
        return result;
    };
    LexerIterator.prototype.getNextToken = function () {
        while (this.current) {
            if (isWhiteSpace(this.current)) {
                this.skipWhiteSpace();
                continue;
            }
            if (this.current == '(') {
                this.skipComment();
                continue;
            }
            if (isNumeric(this.current)) {
                var n = this.number();
                var ns = n.toString();
                return new NumberToken(TokenType.NUMBER, n, {
                    line: this.position.line,
                    column: this.position.column - ns.length,
                    machine: this.position.machine - ns.length,
                });
            }
            if (isAlphaNumeric(this.current)) {
                var s = this.string();
                return new Token(KeyPhrases.findIndex(function (values) { return values.includes(s); }) ||
                    TokenType.STRING, s, {
                    line: this.position.line,
                    column: this.position.column - s.length,
                    machine: this.position.machine - s.length,
                });
            }
            if (this.current == '\n') {
                this.position.line++;
                this.position.column = 1;
                this.advance();
                continue;
            }
            if (this.current == '\r') {
                this.advance();
                continue;
            }
            if (this.current == '.') {
                this.advance();
                return new Token(TokenType.FullStop, '.', this.position);
            }
            if (this.current == ',') {
                this.advance();
                return new Token(TokenType.COMMA, ',', this.position);
            }
            break;
        }
        return new Token(TokenType.EOF, null, this.position);
    };
    LexerIterator.prototype.next = function () {
        var token = this.getNextToken();
        this.done = token.type == TokenType.EOF;
        this.index++;
        return {
            done: this.done,
            value: token,
        };
    };
    return LexerIterator;
}());
exports.LexerIterator = LexerIterator;
var Lexer = /** @class */ (function () {
    function Lexer(input) {
        this.iterator = new LexerIterator(input);
    }
    Lexer.prototype[Symbol.iterator] = function () {
        return this.iterator;
    };
    Lexer.prototype.array = function () {
        return Array.from(this);
    };
    return Lexer;
}());
exports.default = Lexer;
