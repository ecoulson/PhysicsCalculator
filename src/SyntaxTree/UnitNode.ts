import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class UnitNode extends SyntaxNode {
	public unit: string;

	constructor(token : Token) {
		super(NodeType.Unit);
		this.unit = token.getData(); 
	}
}