export declare enum TokenType {
    COMMA = 100,
    FullStop = 101,
    NUMBER = 102,
    STRING = 103,
    ADD = 0,
    SUBTRACT = 1,
    MULTIPLY = 2,
    DIVIDE = 3,
    EOF = 104
}
export declare class Token {
    type: TokenType;
    value: string | null;
    position: Position;
    constructor(type: TokenType, value: string | null, position: Position);
}
export declare class NumberToken extends Token {
    type: TokenType;
    number: number;
    position: Position;
    constructor(type: TokenType, number: number, position: Position);
}
export interface Position {
    line: number;
    column: number;
    machine: number;
}
export declare class LexerIterator implements Iterator<Token> {
    input: string[];
    position: Position;
    current: string | null;
    private index;
    private done;
    constructor(input: string);
    advance(): void;
    skipWhiteSpace(): void;
    skipComment(): void;
    number(): number;
    string(): string;
    getNextToken(): Token;
    next(): {
        done: boolean;
        value: Token;
    };
}
export default class Lexer implements Iterable<Token> {
    iterator: LexerIterator;
    constructor(input: string);
    [Symbol.iterator](): LexerIterator;
    array(): Token[];
}
