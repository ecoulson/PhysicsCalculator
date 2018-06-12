import { SyntaxNode } from "./SyntaxNode";
import { NodeType } from "./NodeTypes";

export class AbsoluteNode extends SyntaxNode {
	constructor() {
		super(NodeType.Absolute);
	}
}