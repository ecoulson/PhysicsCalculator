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

describe("SyntaxTree Test Suite", () => {
	it("Should Be a Tree of a Number With No Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(inputs[0].input);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, inputs[0].structure);
		checkTreeSize(tree, inputs[0].structure.length);
		checkTreeValue(tree, inputs[0].values);
	});

	it("Should Be a Tree of a Number With a Simple Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(inputs[1].input);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, inputs[1].structure);
		checkTreeSize(tree, inputs[1].structure.length);
		checkTreeValue(tree, inputs[1].values);
	});

	it("Should Be a Tree of a Number With a Complex Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(inputs[2].input);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, inputs[2].structure);
		checkTreeSize(tree, inputs[2].structure.length);
		checkTreeValue(tree, inputs[2].values);
	});

	it("Should Be a Tree of a Number With a Complex Exponent Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(inputs[3].input);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, inputs[3].structure);
		checkTreeSize(tree, inputs[3].structure.length);
		checkTreeValue(tree, inputs[3].values);
	});

	it("Should Be a Tree of a Number With a Complex Negative Exponent Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(inputs[4].input);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, inputs[4].structure);
		checkTreeSize(tree, inputs[4].structure.length);
		checkTreeValue(tree, inputs[4].values);
	});

	it("Should Be a Tree of a Number With a Long Complex Exponent Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(inputs[5].input);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, inputs[5].structure);
		checkTreeSize(tree, inputs[5].structure.length);
		checkTreeValue(tree, inputs[5].values);
	});
});