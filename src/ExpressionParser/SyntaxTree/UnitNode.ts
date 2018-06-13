import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";

export class UnitNode extends SyntaxNode {
	public unit: string;
	public degree: number;

	constructor(token : Token) {
		super(NodeType.Unit);
		this.unit = token.getData();
		this.degree = 1;
	}

	public static createNode(unit: string) {
		let token = new Token(TokenType.Identifier, unit, -1);
		return new UnitNode(token);
	}
}