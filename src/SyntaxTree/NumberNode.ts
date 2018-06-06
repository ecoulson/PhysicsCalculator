import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class NumberNode extends SyntaxNode {
	public number: number;

	constructor(token : Token) {
		super(NodeType.Number);
		this.number = parseFloat(token.getData());
	}
}