import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/SyntaxTree/SyntaxTree';
import { Token } from '../src/ExpressionLexer/Token';
import { TokenType } from '../src/ExpressionLexer/TokenType';
import { SyntaxNode } from '../src/SyntaxTree/SyntaxNode';
import { NodeType } from '../src/SyntaxTree/NodeTypes';
import { checkTreeSize, checkTreeStructure, checkTreeValue } from './Helpers/SyntaxTreeHelper';

const input1 : string = "1";
const structure1 : Array<NodeType> = [NodeType.Number];
const values1 : Array<any> = [1];

const input2 : string = "1m";
const structure2 : Array<NodeType> = [NodeType.Number, NodeType.Unit];
const values2 : Array<any> = [1, "m"];

describe("SyntaxTree Test Suite", () => {
	it("Should Be a Tree of a Term With No Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(input1);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, structure1);
		checkTreeSize(tree, structure1.length);
		checkTreeValue(tree, values1);
	});

	it("Should Be a Tree of a Term With a Simple Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer(input2);
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, structure2);
		checkTreeSize(tree, structure2.length);
		checkTreeValue(tree, values2);
	});
});