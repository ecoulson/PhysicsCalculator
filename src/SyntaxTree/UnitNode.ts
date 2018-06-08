import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class UnitNode extends SyntaxNode {
	public unit: string;
	public degree: number;

	constructor(token : Token) {
		super(NodeType.Unit);
		this.unit = token.getData(); 
		this.degree = 1;
	}
}