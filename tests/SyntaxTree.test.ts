import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/SyntaxTree/SyntaxTree';
import { Token } from '../src/ExpressionLexer/Token';
import { TokenType } from '../src/ExpressionLexer/TokenType';
import { SyntaxNode } from '../src/SyntaxTree/SyntaxNode';
import { NodeType } from '../src/SyntaxTree/NodeTypes';
import { checkTreeSize, checkTreeStructure, checkTreeValue } from './Helpers/SyntaxTreeHelper';
import { readInputFile } from './Helpers/InputHelper';
const inputs: Array<any> = readInputFile('SyntaxTreeInputs');
const treeInputCount = 24;
const errorInput = 24;
describe("SyntaxTree Test Suite", () => {
	for (let i = 0; i < treeInputCount; i++) {
		it(`Should Be a Tree of ${inputs[i].input}`, () => {
			try {
				let lexer : ExpressionLexer = new ExpressionLexer(inputs[i].input);
				let tokens : Array<Token> = lexer.lex();
				let tree : SyntaxTree = new SyntaxTree(tokens);
				tree.build();
				checkTreeStructure(tree, inputs[i].structure);
				checkTreeSize(tree, inputs[i].structure.length);
				checkTreeValue(tree, inputs[i].values);
			} catch(err) {
				throw err;
			}
		});
	}
	it (`Should throw an UnexpectedTokenError`, () => {
		try {
			let lexer : ExpressionLexer = new ExpressionLexer(inputs[errorInput].input);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();	
		} catch (err) {
			expect(err.name).to.equal("UnexpectedTokenError");
		}
	})
});