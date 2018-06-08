import { SyntaxNode } from "./SyntaxNode";
import { Token } from "../ExpressionLexer/Token";
export declare class NumberNode extends SyntaxNode {
    number: number;
    constructor(token: Token);
}
