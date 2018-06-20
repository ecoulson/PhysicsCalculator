import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";

export class NumberNode extends SyntaxNode {
	public number: number;

	constructor(token : Token) {
		super(NodeType.Number);
		this.number = parseFloat(token.getData());
	}

	public static createNode(number: number): NumberNode {
		let token = new Token(TokenType.Number, number.toString(), -1);
		let node = new NumberNode(token);
		return node;
	}
}