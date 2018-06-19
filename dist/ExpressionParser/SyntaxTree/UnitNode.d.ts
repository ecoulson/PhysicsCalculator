import { SyntaxNode } from "./SyntaxNode";
import { Token } from "../ExpressionLexer/Token";
export declare class UnitNode extends SyntaxNode {
    unit: string;
    degree: number;
    prefix: string;
    base: string;
    constructor(token: Token);
    static createNode(unit: string): UnitNode;
}
