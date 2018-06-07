import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";
import { Token } from "../ExpressionLexer/Token";

export class VariableNode extends SyntaxNode {
	public variable: string;
	public unit: SyntaxNode;
	constructor(token : Token) {
		super(NodeType.Variable);
		this.variable = token.getData();
		this.unit = null; // TODO: When saving variables to the document the unit needs to be defined in the table too
	}
}