import { Token } from "../ExpressionLexer/Token";
import { SyntaxNode } from "../SyntaxTree/SyntaxNode";
export declare class SyntaxTree {
    private tokens;
    private offset;
    root: SyntaxNode;
    constructor(tokens: Array<Token>);
    private hasReadAllTokens;
    private isNextToken;
    private readToken;
    build(): void;
    private readSums;
    private readFactor;
    private readExponent;
    private readParentheses;
    private readTerm;
    private readSign;
    private readNumber;
    private addUnits;
    private readVariable;
    private transformNodeIfInvoke;
    private transformNodeIfNegative;
    private readComplexUnit;
    private readExponentUnit;
    private readSimpleUnit;
}
