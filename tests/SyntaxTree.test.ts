import { expect } from 'chai';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { SyntaxTree } from '../src/SyntaxTree/SyntaxTree';
import { Token } from '../src/ExpressionLexer/Token';
import { TokenType } from '../src/ExpressionLexer/TokenType';
import { SyntaxNode } from '../src/SyntaxTree/SyntaxNode';
import { NodeType } from '../src/SyntaxTree/NodeTypes';
import { checkTreeSize, checkTreeStructure } from './Helpers/SyntaxTreeHelper';

const structure1 : Array<NodeType> = [NodeType.NumberNode];

describe("SyntaxTree Test Suite", () => {
	it("Should Read A Term With No Unit", () => {
		let lexer : ExpressionLexer = new ExpressionLexer("1");
		let tokens : Array<Token> = lexer.lex();
		let tree : SyntaxTree = new SyntaxTree(tokens);
		tree.build();
		checkTreeStructure(tree, structure1);
		checkTreeSize(tree, structure1.length);
	});
});