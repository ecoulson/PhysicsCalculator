import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";

export class InvokeNode extends SyntaxNode {
	constructor() {
		super(NodeType.Invoke);
	}
}