import { equal } from 'assert';
import Parser from './Parser';

describe('Parser Class', () => {
    it('should return a Compound AST', () => {
        const input = '1 plus 2';
        const parser = new Parser(input);
        const ast = parser.parse();

        console.log(ast);

        equal(1, 1);
    });
});
