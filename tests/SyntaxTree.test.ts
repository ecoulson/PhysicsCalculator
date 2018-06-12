import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionParser/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/ExpressionParser/SyntaxTree/SyntaxTree';
import { Token } from '../src/ExpressionParser/ExpressionLexer/Token';
import { checkTreeSize, checkTreeStructure, checkTreeValue } from './Helpers/SyntaxTreeHelper';
import { readInputFile } from './Helpers/InputHelper';
const inputs = readInputFile('SyntaxTreeInputs');

describe("SyntaxTree Test Suite", () => {
	for (let i = 0; i < inputs.treeCases.length; i++) {
		it(`Should be a tree of ${inputs.treeCases[i].input}`, () => {
			try {
				let lexer : ExpressionLexer = new ExpressionLexer(inputs.treeCases[i].input);
				let tokens : Array<Token> = lexer.lex();
				let tree : SyntaxTree = new SyntaxTree(tokens);
				tree.build();
				checkTreeStructure(tree, inputs.treeCases[i].structure);
				checkTreeSize(tree, inputs.treeCases[i].structure.length);
				checkTreeValue(tree, inputs.treeCases[i].values);
			} catch(err) {
				throw err;
			}
		});
	}
	it (`Should throw an UnexpectedTokenError`, () => {
		try {
			let lexer : ExpressionLexer = new ExpressionLexer(inputs.errorCases[0].input);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();	
		} catch (err) {
			expect(err.name).to.equal("UnexpectedTokenError");
		}
	})
});