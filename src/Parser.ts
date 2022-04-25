import Lexer, { NumberToken, Token, TokenType } from './Lexer';

export class AST {}

export class Number extends AST {
    token: NumberToken;
    value: number;
    constructor(token: NumberToken) {
        super();
        this.token = token;
        this.value = token.number;
    }
}

export class Operation extends AST {
    token: Token;
    left: AST | null;
    op: Token;
    right: AST | null;
    constructor(left: AST | null, op: Token, right: AST | null) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
    }
}

export class ParserError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export default class Parser {
    current: Token | null;
    lexer: Lexer;
    constructor(input: string) {
        this.lexer = new Lexer(input);
        this.current = this.lexer.next().value;
    }

    eat(token_type: TokenType) {
        if (this.current && this.current.type == token_type) {
            this.current = this.lexer.next().value;
        } else {
            throw new ParserError(
                `SyntaxError: Unexpected ${
                    TokenType[this.current?.type || TokenType.EOF]
                }: '${this.current?.value}' at position ${
                    this.current?.position.line
                }:${this.current?.position.column} expecting ${
                    TokenType[token_type]
                }`
            );
        }
    }

    term(): AST {
        let token = this.current;
        if (
            token &&
            token.type == TokenType.NUMBER &&
            token instanceof NumberToken
        ) {
            this.eat(TokenType.NUMBER);
            return new Number(token);
        } else {
            throw new ParserError(
                `SyntaxError: Unexpected ${
                    TokenType[this.current?.type || TokenType.EOF]
                }: '${this.current?.value}' at position ${
                    this.current?.position.line
                }:${this.current?.position.column} expecting ${
                    TokenType[TokenType.NUMBER]
                }`
            );
        }
    }

    expr(): AST {
        if (this.current && this.current.type == TokenType.EOF)
            throw new ParserError(
                `SyntaxError: Unexpected ${
                    TokenType[this.current?.type || TokenType.EOF]
                }: '${this.current?.value}' at position ${
                    this.current?.position.line
                }:${this.current?.position.column}`
            );
        var node = this.term();
        while (
            this.current &&
            [TokenType.ADD, TokenType.SUBTRACT].indexOf(this.current.type) + 1
        ) {
            var token = this.current;
            if (token.type == TokenType.ADD) {
                this.eat(TokenType.ADD);
            } else if (token.type == TokenType.SUBTRACT) {
                this.eat(TokenType.SUBTRACT);
            }
            node = new Operation(node, token, this.term());
        }
        return node;
    }

    parse(): AST {
        return this.expr();
    }
}
