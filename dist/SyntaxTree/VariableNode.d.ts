import { SyntaxNode } from "./SyntaxNode";
import { Token } from "../ExpressionLexer/Token";
export declare class VariableNode extends SyntaxNode {
    variable: string;
    unit: SyntaxNode;
    constructor(token: Token);
}
