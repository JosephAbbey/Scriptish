import { deepEqual } from 'assert';
import Lexer, { NumberToken, Token, TokenType } from './Lexer';

describe('Lexer Iterator', () => {
    it('complete token stream test', () => {
        deepEqual(new Lexer('3 times 4').array(), [
            new NumberToken(TokenType.NUMBER, 3, {
                machine: 0,
                line: 1,
                column: 1,
            }),
            new Token(TokenType.MULTIPLY, 'times', {
                machine: 2,
                line: 1,
                column: 3,
            }),
            new NumberToken(TokenType.NUMBER, 4, {
                machine: 8,
                line: 1,
                column: 9,
            }),
        ]);
    });
});
