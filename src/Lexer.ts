function isWhiteSpace(character: string) {
    return character === ' ' || character === '\t';
}

function isNumeric(character: string) {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(
        character
    );
}

function isAlphabetic(character: string) {
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

function isAlphaNumeric(character: string) {
    return isAlphabetic(character) || isNumeric(character);
}

export enum TokenType {
    COMMA = 101,
    FullStop = 102,

    // Literals
    NUMBER = 103,
    STRING = 104, // can be a variable name or function name

    // KeyPhrases
    ADD = 0, // "plus", "+"
    SUBTRACT = 1, // "minus", "-"
    MULTIPLY = 2, // "times", "multiplied by", "*"
    DIVIDE = 3, // "divided by", "/"

    // Other
    EOF = 100,
}

const KeyPhrases = [
    ['plus'],
    ['minus'],
    ['times', 'multiplied by'],
    ['divided by'],
];

export class Token {
    constructor(
        public type: TokenType,
        public value: string | null,
        public position: Position
    ) {}
}

export class NumberToken extends Token {
    constructor(
        public type: TokenType,
        public number: number,
        public position: Position
    ) {
        super(TokenType.NUMBER, number.toString(), position);
    }
}

export interface Position {
    line: number;
    column: number;
    machine: number;
}

export class LexerIterator implements Iterator<Token> {
    input: string[];
    position: Position = { line: 1, column: 0, machine: -1 };
    current: string | null = null;

    //@ts-expect-error
    private index = 0;
    private done = false;
    constructor(input: string) {
        this.input = input.split('');
        this.advance();
    }

    advance() {
        this.position.machine++;
        this.position.column++;
        if (this.position.machine > this.input.length - 1) {
            this.current = null; // Indicates end of input
        } else {
            this.current = this.input[this.position.machine];
        }
    }

    skipWhiteSpace() {
        while (this.current && isWhiteSpace(this.current)) {
            this.advance();
        }
    }

    skipComment() {
        while (this.current && this.current !== ')') {
            this.advance();
        }
        this.advance();
    }

    number() {
        let result = '';
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
    }

    string() {
        let result = '';
        while (this.current && isAlphaNumeric(this.current)) {
            result += this.current;
            this.advance();
        }
        return result;
    }

    getNextToken() {
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

            // TODO: Add support for numbers in word form
            if (isAlphaNumeric(this.current)) {
                var s = this.string();
                return new Token(
                    KeyPhrases.findIndex((values) => values.includes(s)) ??
                        TokenType.STRING,
                    s,
                    {
                        line: this.position.line,
                        column: this.position.column - s.length,
                        machine: this.position.machine - s.length,
                    }
                );
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

            if (this.current == '+') {
                this.advance();
                return new Token(TokenType.ADD, '+', this.position);
            }

            if (this.current == '-') {
                this.advance();
                return new Token(TokenType.SUBTRACT, '-', this.position);
            }

            if (this.current == '*') {
                this.advance();
                return new Token(TokenType.MULTIPLY, '*', this.position);
            }

            if (this.current == '/') {
                this.advance();
                return new Token(TokenType.DIVIDE, '/', this.position);
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
    }

    next() {
        var token = this.getNextToken();
        this.done = token.type == TokenType.EOF;
        this.index++;
        return {
            done: this.done,
            value: token,
        };
    }
}

export default class Lexer implements Iterable<Token> {
    private iterator: LexerIterator;
    constructor(input: string) {
        this.iterator = new LexerIterator(input);
    }

    [Symbol.iterator]() {
        return this.iterator;
    }

    next() {
        return this.iterator.next();
    }

    array() {
        return Array.from(this);
    }
}
