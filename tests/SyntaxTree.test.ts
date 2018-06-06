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
	for (let i = 0; i < inputs.length; i++) {
		it(`Should Be a Tree of ${inputs[i].input}`, () => {
			let lexer : ExpressionLexer = new ExpressionLexer(inputs[i].input);
			let tokens : Array<Token> = lexer.lex();
			let tree : SyntaxTree = new SyntaxTree(tokens);
			tree.build();
			checkTreeStructure(tree, inputs[i].structure);
			checkTreeSize(tree, inputs[i].structure.length);
			checkTreeValue(tree, inputs[i].values);
		});
	}
});