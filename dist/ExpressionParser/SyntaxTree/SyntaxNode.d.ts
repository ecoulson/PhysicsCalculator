import { NodeType } from "./NodeTypes";
export declare abstract class SyntaxNode {
    type: NodeType;
    left: SyntaxNode;
    right: SyntaxNode;
    constructor(type: NodeType);
}
