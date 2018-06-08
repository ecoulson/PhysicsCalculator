import { SyntaxNode } from "./SyntaxNode";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";
export declare class OperatorNode extends SyntaxNode {
    operator: TokenType;
    constructor(token: Token);
}
