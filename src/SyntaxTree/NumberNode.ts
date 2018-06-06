import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class NumberNode extends SyntaxNode {
	constructor(token : Token) {
		super(NodeType.Number);
	}
}