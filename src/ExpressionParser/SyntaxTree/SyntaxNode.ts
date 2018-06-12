import { NodeType } from "./NodeTypes";

export abstract class SyntaxNode {
	public type: NodeType;
	public left: SyntaxNode;
	public right: SyntaxNode;

	public constructor(type: NodeType) {
		this.type = type;
	}
}