import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class NumberNode extends SyntaxNode {
	public number: number;
	public isDimensionless : boolean;

	constructor(token : Token, isDimensionless: boolean) {
		super(NodeType.Number);
		this.number = parseFloat(token.getData());
		this.isDimensionless = isDimensionless;
	}
}