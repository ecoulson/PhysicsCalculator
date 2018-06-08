import { SyntaxNode } from "./SyntaxNode";
import { Token } from "../ExpressionLexer/Token";
export declare class UnitNode extends SyntaxNode {
    unit: string;
    constructor(token: Token);
}
