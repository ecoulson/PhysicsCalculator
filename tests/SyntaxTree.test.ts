import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/SyntaxTree/SyntaxTree';
import { Token } from '../src/ExpressionLexer/Token';
import { TokenType } from '../src/ExpressionLexer/TokenType';
import { SyntaxNode } from '../src/SyntaxTree/SyntaxNode';
import { NodeType } from '../src/SyntaxTree/NodeTypes';
import { checkTreeSize, checkTreeStructure } from './Helpers/SyntaxTreeHelper';

const structure1 : Array<NodeType> = [NodeType.Number];
const structure2 : Array<NodeType> = [NodeType.Number, NodeType.Unit];

describe("SyntaxTree Test Suite", () => {
	it("Should Be a Tree of a Term With No Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer("1");
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, structure1);
		checkTreeSize(tree, structure1.length);
	});

	it("Should Be a Tree of a Term With a Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer("1m");
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, structure2);
		checkTreeSize(tree, structure2.length);
	});
});