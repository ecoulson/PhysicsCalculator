import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class VariableNode extends SyntaxNode {
	public variable: string;
	constructor(token : Token) {
		super(NodeType.Variable);
		this.variable = token.getData();
	}
}