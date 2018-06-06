import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";

export class OperatorNode extends SyntaxNode {
	public operator: TokenType;
	constructor(token: Token) {
		super(NodeType.Operator);
		this.operator = token.getTokenType();
	}
}