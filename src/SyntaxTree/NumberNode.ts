import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";

export class NumberNode extends SyntaxNode {
	constructor() {
		super(NodeType.NumberNode);
	}
}