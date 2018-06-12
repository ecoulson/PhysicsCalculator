import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";

export class UnitNode extends SyntaxNode {
	public unit: string;

	constructor(token : Token) {
		super(NodeType.Unit);
		this.unit = token.getData(); 
	}

	public static createNode(unit: string) {
		let token = new Token(TokenType.Identifier, unit, -1);
		return new UnitNode(token);
	}
}