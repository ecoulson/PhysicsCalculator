import { SyntaxNode } from "./SyntaxNode";
import { Token } from "../ExpressionLexer/Token";
import { TokenType } from "../ExpressionLexer/TokenType";
import { UnitNode } from "./UnitNode";
export declare class OperatorNode extends SyntaxNode {
    operator: TokenType;
    resultUnit: UnitNode;
    constructor(token: Token);
    static createNode(operator: string): OperatorNode;
    private static getOperatorType;
    setResultUnit(unit: string): void;
}
